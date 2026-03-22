package rlaxogh76.DevClass.domain.review.controller;

import rlaxogh76.DevClass.domain.review.dto.ReviewRequest;
import rlaxogh76.DevClass.domain.review.dto.ReviewResponse;
import rlaxogh76.DevClass.domain.review.dto.ReviewUpdateRequest;
import rlaxogh76.DevClass.domain.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * GET /api/reviews?courseId=1
     * 강의 리뷰 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviews(@RequestParam Long courseId) {
        return ResponseEntity.ok(reviewService.getReviews(courseId));
    }

    /**
     * POST /api/reviews
     * 리뷰 작성 (수강 중인 강의만 가능, 강의당 1개)
     * TODO: 로그인 완료 후 @AuthenticationPrincipal 적용, Body에서 userId 제거
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(request));
    }

    /**
     * PATCH /api/reviews/{reviewId}
     * 리뷰 수정 (본인만 가능)
     * TODO: 로그인 완료 후 @AuthenticationPrincipal 적용, Body에서 userId 제거
     */
    @PatchMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> update(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewUpdateRequest request
    ) {
        return ResponseEntity.ok(reviewService.update(reviewId, request));
    }

    /**
     * DELETE /api/reviews/{reviewId}?userId=3
     * 리뷰 삭제 (본인만 가능)
     * TODO: 로그인 완료 후 @AuthenticationPrincipal 적용, @RequestParam userId 제거
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long reviewId,
            @RequestParam Long userId
    ) {
        reviewService.delete(reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}