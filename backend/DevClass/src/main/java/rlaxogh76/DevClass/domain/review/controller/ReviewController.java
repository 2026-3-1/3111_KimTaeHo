package rlaxogh76.DevClass.domain.review.controller;

import rlaxogh76.DevClass.domain.review.dto.ReviewRequest;
import rlaxogh76.DevClass.domain.review.dto.ReviewResponse;
import rlaxogh76.DevClass.domain.review.dto.ReviewUpdateRequest;
import rlaxogh76.DevClass.domain.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Review", description = "강의 리뷰 API")
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(
            summary = "리뷰 목록 조회",
            description = "특정 강의의 리뷰 목록을 최신순으로 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(
                            examples = @ExampleObject(value = """
                                    [
                                      {
                                        "reviewId": 1,
                                        "userId": 4,
                                        "userEmail": "student1@devclass.com",
                                        "rating": 5,
                                        "comment": "정말 유익한 강의였습니다.",
                                        "createdAt": "2026-03-23T23:00:00"
                                      }
                                    ]
                                    """)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "강의 없음")
    })
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviews(
            @Parameter(description = "강의 ID", example = "1")
            @RequestParam Long courseId
    ) {
        return ResponseEntity.ok(reviewService.getReviews(courseId));
    }

    @Operation(
            summary = "리뷰 작성",
            description = "수강 중인 강의에 리뷰를 작성합니다. 강의당 1개만 작성 가능합니다. rating은 1~5 사이 정수입니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "리뷰 작성 성공",
                    content = @Content(schema = @Schema(implementation = ReviewResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "수강하지 않은 강의"),
            @ApiResponse(responseCode = "409", description = "이미 리뷰 작성한 강의")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                    examples = @ExampleObject(value = """
                            {
                              "userId": 4,
                              "courseId": 3,
                              "rating": 5,
                              "comment": "정말 유익한 강의였습니다."
                            }
                            """)
            )
    )
    @PostMapping
    public ResponseEntity<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(request));
    }

    @Operation(
            summary = "리뷰 수정",
            description = "본인이 작성한 리뷰를 수정합니다. rating과 comment 모두 수정 가능합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공",
                    content = @Content(schema = @Schema(implementation = ReviewResponse.class))
            ),
            @ApiResponse(responseCode = "403", description = "본인 리뷰가 아님")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                    examples = @ExampleObject(value = """
                            {
                              "userId": 4,
                              "rating": 4,
                              "comment": "수정된 리뷰입니다."
                            }
                            """)
            )
    )
    @PatchMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> update(
            @Parameter(description = "리뷰 ID", example = "1")
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewUpdateRequest request
    ) {
        return ResponseEntity.ok(reviewService.update(reviewId, request));
    }

    @Operation(
            summary = "리뷰 삭제",
            description = "본인이 작성한 리뷰를 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "본인 리뷰가 아님")
    })
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "리뷰 ID", example = "1")
            @PathVariable Long reviewId,
            @Parameter(description = "사용자 ID (로그인 구현 후 제거 예정)", example = "4")
            @RequestParam Long userId
    ) {
        reviewService.delete(reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}