package rlaxogh76.DevClass.domain.admin.service;

import rlaxogh76.DevClass.domain.admin.dto.*;
import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.enrollment.repository.EnrollmentRepository;
import rlaxogh76.DevClass.domain.payment.entity.Payment;
import rlaxogh76.DevClass.domain.payment.entity.PaymentStatus;
import rlaxogh76.DevClass.domain.payment.repository.PaymentRepository;
import rlaxogh76.DevClass.domain.qna.repository.AnswerRepository;
import rlaxogh76.DevClass.domain.qna.repository.QuestionRepository;
import rlaxogh76.DevClass.domain.review.repository.ReviewRepository;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import rlaxogh76.DevClass.global.notification.EmailService;
import rlaxogh76.DevClass.global.payment.TossPaymentClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final TossPaymentClient tossPaymentClient;
    private final EmailService emailService;

    // ── 통계 ───────────────────────────────────────────────────────────────

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalPayments = paymentRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAID || p.getStatus() == PaymentStatus.PARTIALLY_REFUNDED)
                .mapToLong(Payment::getAmount)
                .sum();
        return new AdminStatsResponse(totalUsers, totalCourses, totalPayments, totalRevenue, totalEnrollments);
    }

    public List<AdminRevenueResponse> getDailyRevenue() {
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        Map<String, Long> grouped = paymentRepository.findAll().stream()
                .filter(p -> p.getCreatedAt().isAfter(from)
                        && (p.getStatus() == PaymentStatus.PAID || p.getStatus() == PaymentStatus.PARTIALLY_REFUNDED))
                .collect(Collectors.groupingBy(
                        p -> p.getCreatedAt().toLocalDate().toString(),
                        Collectors.summingLong(Payment::getAmount)
                ));
        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new AdminRevenueResponse(e.getKey(), e.getValue()))
                .toList();
    }

    // ── 회원 관리 ──────────────────────────────────────────────────────────

    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(AdminUserResponse::from).toList();
    }

    @Transactional
    public AdminUserResponse changeUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.changeRole(User.Role.valueOf(role));
        return AdminUserResponse.from(user);
    }

    @Transactional
    public AdminUserResponse toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.isActive()) user.deactivate(); else user.activate();
        return AdminUserResponse.from(user);
    }

    // ── 강좌 관리 ──────────────────────────────────────────────────────────

    public List<AdminCourseResponse> getCourses() {
        return courseRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(AdminCourseResponse::from).toList();
    }

    @Transactional
    public void adminUnpublishCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));
        course.unpublish();
    }

    @Transactional
    public void adminDeleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

        List<Payment> affected = paymentRepository.findActiveByCourseId(
                String.valueOf(courseId), List.of(PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED));

        for (Payment payment : affected) {
            if (!payment.containsCourse(courseId)) continue;
            User student = userRepository.findById(payment.getUserId()).orElse(null);
            if (student == null) continue;
            long courseCount = payment.getCourseIds().split(",").length;
            try {
                if (courseCount == 1) {
                    tossPaymentClient.cancelPayment(payment.getPaymentKey(), "관리자의 강좌 강제 삭제로 인한 환불");
                    payment.refund();
                } else {
                    long refundAmount = course.getPrice();
                    tossPaymentClient.cancelPartialPayment(payment.getPaymentKey(), "관리자의 강좌 강제 삭제로 인한 부분 환불", refundAmount);
                    payment.removeCourseId(courseId);
                    payment.partialRefund(refundAmount);
                }
                emailService.sendCourseDeletedRefundNotification(
                        student.getEmail(), student.getName(), course.getTitle(),
                        courseCount == 1 ? payment.getAmount() : course.getPrice());
            } catch (IOException | InterruptedException e) {
                log.error("[Admin Delete] Toss 환불 실패 paymentKey={} courseId={}", payment.getPaymentKey(), courseId, e);
                throw new BusinessException(ErrorCode.PAYMENT_CANCEL_FAILED);
            }
        }
        enrollmentRepository.deleteByCourseId(courseId);
        courseRepository.delete(course);
    }

    // ── 결제 관리 ──────────────────────────────────────────────────────────

    public List<AdminPaymentResponse> getPayments() {
        return paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(AdminPaymentResponse::from).toList();
    }

    @Transactional
    public void refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_CANCELLED);
        }
        if (payment.getStatus() != PaymentStatus.PAID && payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_CANCELLED);
        }
        try {
            tossPaymentClient.cancelPayment(payment.getPaymentKey(), "관리자 수동 환불");
            payment.refund();
        } catch (IOException | InterruptedException e) {
            log.error("[Admin Refund] Toss 환불 실패 paymentId={}", paymentId, e);
            throw new BusinessException(ErrorCode.PAYMENT_CANCEL_FAILED);
        }
    }

    // ── 리뷰 관리 ──────────────────────────────────────────────────────────

    public List<AdminReviewResponse> getReviews() {
        return reviewRepository.findAllWithUserAndCourse()
                .stream().map(AdminReviewResponse::from).toList();
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new BusinessException(ErrorCode.REVIEW_NOT_FOUND);
        }
        reviewRepository.deleteById(reviewId);
    }

    // ── Q&A 관리 ───────────────────────────────────────────────────────────

    public List<AdminQnaResponse> getQuestions() {
        return questionRepository.findAllWithAuthorAndCourse()
                .stream().map(AdminQnaResponse::from).toList();
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new BusinessException(ErrorCode.QUESTION_NOT_FOUND);
        }
        questionRepository.deleteById(questionId);
    }

    @Transactional
    public void deleteAnswer(Long answerId) {
        if (!answerRepository.existsById(answerId)) {
            throw new BusinessException(ErrorCode.ANSWER_NOT_FOUND);
        }
        answerRepository.deleteById(answerId);
    }

    // ── 이메일 일괄 발송 ────────────────────────────────────────────────────

    @Async
    @Transactional(readOnly = true)
    public void sendBroadcastEmail(String subject, String htmlContent, String target) {
        List<String> targetEmails = userRepository.findAll().stream()
                .filter(User::isActive)
                .filter(u -> switch (target == null ? "ALL" : target.toUpperCase()) {
                    case "STUDENT" -> u.getRole() == User.Role.STUDENT;
                    case "TEACHER" -> u.getRole() == User.Role.TEACHER || u.getRole() == User.Role.PENDING_TEACHER;
                    default -> true;
                })
                .map(User::getEmail)
                .distinct()
                .toList();
        log.info("[Admin Broadcast] 발송 대상 {}명, subject={}", targetEmails.size(), subject);
        for (String email : targetEmails) {
            try {
                emailService.sendCustom(email, subject, htmlContent);
            } catch (Exception e) {
                log.warn("[Admin Broadcast] 발송 실패 email={}", email, e);
            }
        }
    }
}
