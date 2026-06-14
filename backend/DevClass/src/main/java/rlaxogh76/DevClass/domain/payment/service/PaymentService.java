package rlaxogh76.DevClass.domain.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rlaxogh76.DevClass.domain.cart.entity.CartItem;
import rlaxogh76.DevClass.domain.cart.repository.CartItemRepository;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.enrollment.dto.EnrollmentRequest;
import rlaxogh76.DevClass.domain.enrollment.service.EnrollmentService;
import rlaxogh76.DevClass.domain.payment.dto.PaymentConfirmRequest;
import rlaxogh76.DevClass.domain.payment.dto.PaymentConfirmResponse;
import rlaxogh76.DevClass.domain.payment.dto.PaymentHistoryResponse;
import rlaxogh76.DevClass.domain.payment.dto.PaymentOrderResponse;
import rlaxogh76.DevClass.domain.payment.entity.Payment;
import rlaxogh76.DevClass.domain.payment.entity.PaymentStatus;
import rlaxogh76.DevClass.domain.payment.repository.PaymentRepository;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import rlaxogh76.DevClass.global.notification.DiscordService;
import rlaxogh76.DevClass.global.notification.EmailService;
import rlaxogh76.DevClass.global.payment.TossPaymentClient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CartItemRepository cartItemRepository;
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EmailService emailService;
    private final DiscordService discordService;
    private final TossPaymentClient tossPaymentClient;

    @Value("${refund.max-progress-percent:30}")
    private int maxProgressPercent;

    @Transactional
    public PaymentOrderResponse createOrder(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() != User.Role.STUDENT) {
            throw new BusinessException(ErrorCode.NOT_STUDENT);
        }

        List<CartItem> cartItems = cartItemRepository.findAllByUserIdWithCourse(userId);
        if (cartItems.isEmpty()) {
            throw new BusinessException(ErrorCode.CART_EMPTY);
        }

        long amount = cartItems.stream()
                .mapToLong(item -> item.getCourse().getPrice())
                .sum();

        String orderId = "DC-" + userId + "-" + System.currentTimeMillis();

        String courseIds = cartItems.stream()
                .map(item -> String.valueOf(item.getCourse().getId()))
                .collect(Collectors.joining(","));

        String orderName = cartItems.size() == 1
                ? cartItems.get(0).getCourse().getTitle()
                : cartItems.get(0).getCourse().getTitle() + " 외 " + (cartItems.size() - 1) + "개";

        paymentRepository.save(Payment.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .courseIds(courseIds)
                .build());

        return new PaymentOrderResponse(orderId, amount, orderName, user.getName());
    }

    @Transactional
    public PaymentConfirmResponse confirmPayment(PaymentConfirmRequest request) {
        Payment payment = paymentRepository.findByOrderId(request.orderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        // 멱등성 처리: 이미 결제 완료된 주문은 Toss API 재호출 없이 즉시 반환
        if (payment.getStatus() == PaymentStatus.PAID) {
            log.warn("[Payment] 중복 결제 확인 요청 무시 orderId={}", request.orderId());
            List<Long> courseIds = List.of(payment.getCourseIds().split(",")).stream()
                    .map(Long::parseLong).toList();
            return new PaymentConfirmResponse(courseIds.size(), courseIds);
        }

        if (!payment.getAmount().equals(request.amount())) {
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        try {
            tossPaymentClient.confirmPayment(request.paymentKey(), request.orderId(), request.amount());
        } catch (IOException | InterruptedException e) {
            log.error("[Payment] Toss API 호출 실패 orderId={}", request.orderId(), e);
            throw new BusinessException(ErrorCode.PAYMENT_CONFIRM_FAILED);
        }

        payment.confirm(request.paymentKey());

        List<Long> courseIds = List.of(payment.getCourseIds().split(",")).stream()
                .map(Long::parseLong)
                .toList();

        List<Long> enrolledCourseIds = new ArrayList<>();
        for (Long courseId : courseIds) {
            try {
                enrollmentService.enroll(new EnrollmentRequest(request.userId(), courseId));
                enrolledCourseIds.add(courseId);
            } catch (BusinessException e) {
                if (e.getErrorCode() == ErrorCode.ALREADY_ENROLLED) {
                    enrolledCourseIds.add(courseId);
                }
            }
            cartItemRepository.findByUserIdAndCourseId(request.userId(), courseId)
                    .ifPresent(cartItemRepository::delete);
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        List<String> courseTitles = courseRepository.findAllById(courseIds)
                .stream().map(c -> c.getTitle()).toList();
        String orderName = courseTitles.isEmpty() ? "강좌"
                : courseTitles.size() == 1 ? courseTitles.get(0)
                : courseTitles.get(0) + " 외 " + (courseTitles.size() - 1) + "개";

        emailService.sendPaymentReceipt(user.getEmail(), user.getName(), orderName, payment.getAmount());
        discordService.sendPaymentAlert(user.getName(), orderName, payment.getAmount());

        return new PaymentConfirmResponse(enrolledCourseIds.size(), enrolledCourseIds);
    }

    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> getMyPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(payment -> {
                    List<Long> courseIds = Arrays.stream(payment.getCourseIds().split(","))
                            .map(Long::parseLong)
                            .toList();

                    List<PaymentHistoryResponse.CourseRefundInfo> courses = courseIds.stream()
                            .map(courseId -> {
                                String title = courseRepository.findById(courseId)
                                        .map(c -> c.getTitle())
                                        .orElse("삭제된 강의");
                                int progress = enrollmentService.getProgressForCourse(userId, courseId);
                                return new PaymentHistoryResponse.CourseRefundInfo(courseId, title, progress);
                            })
                            .toList();

                    boolean refundEligible = payment.getStatus() == PaymentStatus.PAID
                            && courses.stream().allMatch(c -> c.progress() <= maxProgressPercent);

                    return new PaymentHistoryResponse(
                            payment.getOrderId(),
                            payment.getAmount(),
                            payment.getStatus().name(),
                            payment.getCreatedAt(),
                            payment.getRefundedAt(),
                            courses,
                            refundEligible
                    );
                })
                .toList();
    }

    @Transactional
    public void refundPayment(Long userId, String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_REFUNDED);
        }
        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new BusinessException(ErrorCode.PAYMENT_NOT_FOUND);
        }

        List<Long> courseIds = Arrays.stream(payment.getCourseIds().split(","))
                .map(Long::parseLong)
                .toList();

        enrollmentService.validateRefundEligibility(userId, courseIds, maxProgressPercent);

        try {
            tossPaymentClient.cancelPayment(payment.getPaymentKey(), "고객 환불 요청");
        } catch (IOException | InterruptedException e) {
            log.error("[Payment] Toss 결제 취소 실패 orderId={}", orderId, e);
            throw new BusinessException(ErrorCode.PAYMENT_CANCEL_FAILED);
        }

        payment.refund();
        enrollmentService.cancelForRefund(userId, courseIds);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        discordService.sendRefundAlert(user.getName(), payment.getAmount());
    }
}
