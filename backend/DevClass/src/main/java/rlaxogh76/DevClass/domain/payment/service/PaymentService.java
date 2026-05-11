package rlaxogh76.DevClass.domain.payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rlaxogh76.DevClass.domain.cart.entity.CartItem;
import rlaxogh76.DevClass.domain.cart.repository.CartItemRepository;
import rlaxogh76.DevClass.domain.enrollment.dto.EnrollmentRequest;
import rlaxogh76.DevClass.domain.enrollment.service.EnrollmentService;
import rlaxogh76.DevClass.domain.payment.dto.PaymentConfirmRequest;
import rlaxogh76.DevClass.domain.payment.dto.PaymentConfirmResponse;
import rlaxogh76.DevClass.domain.payment.dto.PaymentOrderResponse;
import rlaxogh76.DevClass.domain.payment.entity.Payment;
import rlaxogh76.DevClass.domain.payment.entity.PaymentStatus;
import rlaxogh76.DevClass.domain.payment.repository.PaymentRepository;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CartItemRepository cartItemRepository;
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

    @Value("${toss.secret-key}")
    private String tossSecretKey;

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

        if (!payment.getAmount().equals(request.amount())) {
            throw new BusinessException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }

        callTossConfirmApi(request.paymentKey(), request.orderId(), request.amount());

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

        return new PaymentConfirmResponse(enrolledCourseIds.size(), enrolledCourseIds);
    }

    private void callTossConfirmApi(String paymentKey, String orderId, Long amount) {
        try {
            String credentials = Base64.getEncoder()
                    .encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));

            String body = String.format(
                    "{\"paymentKey\":\"%s\",\"orderId\":\"%s\",\"amount\":%d}",
                    paymentKey, orderId, amount
            );

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.tosspayments.com/v1/payments/confirm"))
                    .header("Authorization", "Basic " + credentials)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = HttpClient.newBuilder()
                    .proxy(HttpClient.Builder.NO_PROXY)
                    .build()
                    .send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.out.println("[Toss Error] status=" + response.statusCode() + " body=" + response.body());
                throw new BusinessException(ErrorCode.PAYMENT_CONFIRM_FAILED);
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            System.out.println("[Toss Exception] " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            throw new BusinessException(ErrorCode.PAYMENT_CONFIRM_FAILED);
        }
    }
}
