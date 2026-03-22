package rlaxogh76.DevClass.domain.enrollment.controller;

import rlaxogh76.DevClass.domain.enrollment.dto.*;
import rlaxogh76.DevClass.domain.enrollment.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    /**
     * POST /api/enrollments
     * 수강 신청
     * TODO: 로그인 완료 후 @AuthenticationPrincipal User user 추가, Body에서 userId 제거
     */
    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(
            @Valid @RequestBody EnrollmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.enroll(request));
    }

    /**
     * GET /api/enrollments/my?userId=3
     * 내 수강 목록 조회
     * TODO: 로그인 완료 후 @AuthenticationPrincipal User user 추가, @RequestParam userId 제거
     */
    @GetMapping("/my")
    public ResponseEntity<List<MyEnrollmentResponse>> getMyEnrollments(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(userId));
    }

    /**
     * DELETE /api/enrollments/{enrollmentId}?userId=3
     * 수강 취소
     * TODO: 로그인 완료 후 @AuthenticationPrincipal User user 추가, @RequestParam userId 제거
     */
    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> cancel(
            @RequestParam Long userId,
            @PathVariable Long enrollmentId
    ) {
        enrollmentService.cancel(userId, enrollmentId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/enrollments/{enrollmentId}/progress
     * 학습 진행률 저장
     * TODO: 로그인 완료 후 @AuthenticationPrincipal User user 추가, Body에서 userId 제거
     */
    @PatchMapping("/{enrollmentId}/progress")
    public ResponseEntity<ProgressUpdateResponse> updateProgress(
            @PathVariable Long enrollmentId,
            @Valid @RequestBody ProgressUpdateRequest request
    ) {
        return ResponseEntity.ok(
                enrollmentService.updateProgress(enrollmentId, request)
        );
    }
}