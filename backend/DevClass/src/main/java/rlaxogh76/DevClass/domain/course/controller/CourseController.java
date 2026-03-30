package rlaxogh76.DevClass.domain.course.controller;

import rlaxogh76.DevClass.domain.course.dto.CourseDetailResponse;
import rlaxogh76.DevClass.domain.course.dto.CourseFilterRequest;
import rlaxogh76.DevClass.domain.course.dto.CoursePageResponse;
import rlaxogh76.DevClass.domain.course.dto.LectureResponse;
import rlaxogh76.DevClass.domain.course.service.CourseService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Course", description = "강의 조회 API")
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @Operation(
            summary = "강의 목록 조회",
            description = """
                    강의 목록을 조회합니다. 키워드 검색, 카테고리/난이도/가격/평점 필터링, 정렬을 지원합니다.
                    
                    **sort 옵션**
                    - 미입력: 최신순
                    - `popular`: 인기순 (수강생 수)
                    - `rating`: 평점 높은순
                    - `price_asc`: 가격 낮은순
                    - `price_desc`: 가격 높은순
                    
                    **level 옵션**: `BEGINNER` / `INTERMEDIATE` / `ADVANCED`
                    
                    **category 옵션**: `frontend` / `backend` / `database` / `devops` / `algorithm`
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping
    public ResponseEntity<CoursePageResponse> getCourses(
            @ModelAttribute @Valid CourseFilterRequest req
    ) {
        return ResponseEntity.ok(courseService.getCourses(req));
    }

    @Operation(
            summary = "강의 상세 조회",
            description = "강의 ID로 강의 상세 정보를 조회합니다. 강의 제목, 설명, 가격, 강사 정보, 강의 수, 평균 평점, 리뷰 수를 포함합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = CourseDetailResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "id": 1,
                                      "title": "React 완벽 가이드",
                                      "description": "React 기초부터 고급까지 다루는 강의입니다.",
                                      "price": 39000,
                                      "teacherId": 1,
                                      "teacherName": "teacher1@devclass.com",
                                      "category": "frontend",
                                      "level": "BEGINNER",
                                      "lectureCount": 8,
                                      "averageRating": 4.80,
                                      "reviewCount": 2
                                    }
                                    """)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "강의 없음")
    })
    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetailResponse> getCourse(
            @Parameter(description = "강의 ID", example = "1")
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(courseService.getCourse(courseId));
    }

    @Operation(
            summary = "강의 영상 목록 조회",
            description = "강의에 포함된 영상(Lecture) 목록을 순서대로 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(
                            examples = @ExampleObject(value = """
                                    [
                                      { "id": 1, "title": "React란 무엇인가?", "videoUrl": "https://video.devclass.com/1/1", "duration": 600, "sequence": 1 },
                                      { "id": 2, "title": "개발 환경 세팅", "videoUrl": "https://video.devclass.com/1/2", "duration": 480, "sequence": 2 }
                                    ]
                                    """)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "강의 없음")
    })
    @GetMapping("/{courseId}/lectures")
    public ResponseEntity<List<LectureResponse>> getLectures(
            @Parameter(description = "강의 ID", example = "1")
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(courseService.getLectures(courseId));
    }
}