package rlaxogh76.DevClass.domain.enrollment.controller;

import rlaxogh76.DevClass.domain.enrollment.dto.*;
import rlaxogh76.DevClass.domain.enrollment.service.EnrollmentService;
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

@Tag(name = "Enrollment", description = "수강 신청 / 진행률 API")
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @Operation(
            summary = "수강 신청",
            description = "학생이 강의를 수강 신청합니다. 이미 수강 중인 강의는 중복 신청이 불가합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "수강 신청 성공",
                    content = @Content(
                            schema = @Schema(implementation = EnrollmentResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "enrollmentId": 7,
                                      "courseId": 3,
                                      "userId": 4,
                                      "progress": 0
                                    }
                                    """)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "사용자 또는 강의 없음"),
            @ApiResponse(responseCode = "409", description = "이미 수강 중인 강의")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                    examples = @ExampleObject(value = """
                            {
                              "userId": 4,
                              "courseId": 3
                            }
                            """)
            )
    )
    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(
            @Valid @RequestBody EnrollmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.enroll(request));
    }

    @Operation(
            summary = "내 수강 목록 조회",
            description = "학생의 수강 중인 강의 목록을 조회합니다. 강의 정보와 진행률을 포함합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "사용자 없음")
    })
    @GetMapping("/my")
    public ResponseEntity<List<MyEnrollmentResponse>> getMyEnrollments(
            @Parameter(description = "사용자 ID (로그인 구현 후 제거 예정)", example = "4")
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(userId));
    }

    @Operation(
            summary = "수강 취소",
            description = "수강을 취소합니다. 학습 진행률이 0%인 경우에만 취소 가능합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "수강 취소 성공"),
            @ApiResponse(responseCode = "400", description = "진행률이 0% 초과로 취소 불가"),
            @ApiResponse(responseCode = "404", description = "수강 정보 없음")
    })
    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> cancel(
            @Parameter(description = "사용자 ID (로그인 구현 후 제거 예정)", example = "4")
            @RequestParam Long userId,
            @Parameter(description = "수강 ID", example = "1")
            @PathVariable Long enrollmentId
    ) {
        enrollmentService.cancel(userId, enrollmentId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "학습 진행률 저장",
            description = "강의 영상 시청 후 학습 진행률을 저장합니다. lastWatchedLectureId는 반드시 해당 강의 소속 영상이어야 합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "저장 성공",
                    content = @Content(
                            examples = @ExampleObject(value = """
                                    {
                                      "enrollmentId": 1,
                                      "progress": 35
                                    }
                                    """)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "다른 강의 소속 영상 ID 전달"),
            @ApiResponse(responseCode = "404", description = "수강 정보 또는 영상 없음")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                    examples = @ExampleObject(value = """
                            {
                              "userId": 4,
                              "lastWatchedLectureId": 3,
                              "currentProgress": 35
                            }
                            """)
            )
    )
    @PatchMapping("/{enrollmentId}/progress")
    public ResponseEntity<ProgressUpdateResponse> updateProgress(
            @Parameter(description = "수강 ID", example = "1")
            @PathVariable Long enrollmentId,
            @Valid @RequestBody ProgressUpdateRequest request
    ) {
        return ResponseEntity.ok(enrollmentService.updateProgress(enrollmentId, request));
    }
}