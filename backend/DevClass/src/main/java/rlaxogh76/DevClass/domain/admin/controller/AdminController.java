package rlaxogh76.DevClass.domain.admin.controller;

import rlaxogh76.DevClass.domain.admin.dto.*;
import rlaxogh76.DevClass.domain.admin.service.AdminService;
import rlaxogh76.DevClass.domain.teacher.dto.TeacherApplicationResponse;
import rlaxogh76.DevClass.domain.teacher.dto.TeacherRejectRequest;
import rlaxogh76.DevClass.domain.teacher.service.TeacherApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final TeacherApplicationService teacherApplicationService;

    private final AdminService adminService;

    // ── 통계 ───────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/stats/revenue")
    public ResponseEntity<List<AdminRevenueResponse>> getDailyRevenue() {
        return ResponseEntity.ok(adminService.getDailyRevenue());
    }

    // ── 회원 관리 ──────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<AdminUserResponse> changeUserRole(
            @PathVariable Long userId,
            @RequestBody UserRoleRequest request) {
        return ResponseEntity.ok(adminService.changeUserRole(userId, request.role()));
    }

    @PatchMapping("/users/{userId}/active")
    public ResponseEntity<AdminUserResponse> toggleUserActive(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.toggleUserActive(userId));
    }

    // ── 강좌 관리 ──────────────────────────────────────────────────────────

    @GetMapping("/courses")
    public ResponseEntity<List<AdminCourseResponse>> getCourses() {
        return ResponseEntity.ok(adminService.getCourses());
    }

    @DeleteMapping("/courses/{courseId}/publish")
    public ResponseEntity<Void> adminUnpublishCourse(@PathVariable Long courseId) {
        adminService.adminUnpublishCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<Void> adminDeleteCourse(@PathVariable Long courseId) {
        adminService.adminDeleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    // ── 결제 관리 ──────────────────────────────────────────────────────────

    @GetMapping("/payments")
    public ResponseEntity<List<AdminPaymentResponse>> getPayments() {
        return ResponseEntity.ok(adminService.getPayments());
    }

    @PostMapping("/payments/{paymentId}/refund")
    public ResponseEntity<Void> refundPayment(@PathVariable Long paymentId) {
        adminService.refundPayment(paymentId);
        return ResponseEntity.noContent().build();
    }

    // ── 리뷰 관리 ──────────────────────────────────────────────────────────

    @GetMapping("/reviews")
    public ResponseEntity<List<AdminReviewResponse>> getReviews() {
        return ResponseEntity.ok(adminService.getReviews());
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        adminService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    // ── Q&A 관리 ───────────────────────────────────────────────────────────

    @GetMapping("/questions")
    public ResponseEntity<List<AdminQnaResponse>> getQuestions() {
        return ResponseEntity.ok(adminService.getQuestions());
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        adminService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long answerId) {
        adminService.deleteAnswer(answerId);
        return ResponseEntity.noContent().build();
    }

    // ── 이메일 일괄 발송 ────────────────────────────────────────────────────

    @PostMapping("/email/broadcast")
    public ResponseEntity<Void> sendBroadcast(@RequestBody BulkEmailRequest request) {
        adminService.sendBroadcastEmail(request.subject(), request.content(), request.target());
        return ResponseEntity.accepted().build();
    }

    // ── 감사 로그 ──────────────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AdminAuditLogResponse>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    // ── 강사 신청 관리 ────────────────────────────────────────────────────

    @GetMapping("/teacher-applications")
    public ResponseEntity<List<TeacherApplicationResponse>> getTeacherApplications() {
        return ResponseEntity.ok(teacherApplicationService.getAll());
    }

    @PostMapping("/teacher-applications/{id}/approve")
    public ResponseEntity<Void> approveTeacherApplication(@PathVariable Long id) {
        teacherApplicationService.approve(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/teacher-applications/{id}/reject")
    public ResponseEntity<Void> rejectTeacherApplication(
            @PathVariable Long id,
            @RequestBody(required = false) TeacherRejectRequest request) {
        teacherApplicationService.reject(id, request != null ? request.reason() : null);
        return ResponseEntity.ok().build();
    }
}
