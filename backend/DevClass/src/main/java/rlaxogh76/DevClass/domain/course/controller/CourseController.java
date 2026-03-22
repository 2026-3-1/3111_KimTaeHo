package rlaxogh76.DevClass.domain.course.controller;

import rlaxogh76.DevClass.domain.course.dto.CourseDetailResponse;
import rlaxogh76.DevClass.domain.course.dto.CoursePageResponse;
import rlaxogh76.DevClass.domain.course.dto.LectureResponse;
import rlaxogh76.DevClass.domain.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    /**
     * GET /api/courses
     * ?keyword=react&category=프론트엔드&level=입문&sort=price_asc&page=1&size=8
     */
    @GetMapping
    public ResponseEntity<CoursePageResponse> getCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "8")  int size
    ) {
        return ResponseEntity.ok(
                courseService.getCourses(keyword, category, level, page, size, sort)
        );
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetailResponse> getCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getCourse(courseId));
    }

    @GetMapping("/{courseId}/lectures")
    public ResponseEntity<List<LectureResponse>> getLectures(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getLectures(courseId));
    }
}