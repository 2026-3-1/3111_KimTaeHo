package rlaxogh76.DevClass.domain.course.controller;

import rlaxogh76.DevClass.domain.course.dto.CourseDetailResponse;
import rlaxogh76.DevClass.domain.course.dto.CourseFilterRequest;
import rlaxogh76.DevClass.domain.course.dto.CoursePageResponse;
import rlaxogh76.DevClass.domain.course.dto.LectureResponse;
import rlaxogh76.DevClass.domain.course.service.CourseService;
import jakarta.validation.Valid;
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
     * ?keyword=react&category=backend&level=BEGINNER
     * &sort=newest|popular|rating|price_asc|price_desc
     * &page=0&size=8
     */
    @GetMapping
    public ResponseEntity<CoursePageResponse> getCourses(
            @ModelAttribute @Valid CourseFilterRequest req
    ) {
        return ResponseEntity.ok(courseService.getCourses(req));
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