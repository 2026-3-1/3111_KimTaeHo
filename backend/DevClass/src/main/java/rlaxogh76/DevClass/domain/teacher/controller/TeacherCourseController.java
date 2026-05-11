package rlaxogh76.DevClass.domain.teacher.controller;

import rlaxogh76.DevClass.domain.review.dto.ReviewResponse;
import rlaxogh76.DevClass.domain.review.service.ReviewService;
import rlaxogh76.DevClass.domain.teacher.dto.*;
import rlaxogh76.DevClass.domain.teacher.service.ProfileService;
import rlaxogh76.DevClass.domain.teacher.service.TeacherCourseService;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Teacher", description = "강사용 강의 관리 API")
@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherCourseController {

    private final TeacherCourseService teacherCourseService;
    private final ProfileService profileService;
    private final ReviewService reviewService;

    @Operation(summary = "내 프로필 조회")
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal User user) {
        requireLogin(user);
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @Operation(summary = "프로필 수정")
    @PatchMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody ProfileUpdateRequest request) {
        requireLogin(user);
        return ResponseEntity.ok(profileService.updateProfile(user.getId(), request));
    }

    @Operation(summary = "내 강의 목록 조회")
    @GetMapping("/courses")
    public ResponseEntity<List<TeacherCourseResponse>> getMyCourses(@AuthenticationPrincipal User user) {
        requireTeacher(user);
        return ResponseEntity.ok(teacherCourseService.getMyCourses(user.getId()));
    }

    @Operation(summary = "내 강의 상세 조회")
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<TeacherCourseResponse> getCourse(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId) {
        requireTeacher(user);
        return ResponseEntity.ok(teacherCourseService.getCourse(courseId, user.getId()));
    }

    @Operation(summary = "강의 등록")
    @PostMapping("/courses")
    public ResponseEntity<TeacherCourseResponse> createCourse(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CourseCreateRequest request) {
        requireTeacher(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teacherCourseService.createCourse(request, user.getId()));
    }

    @Operation(summary = "강의 수정")
    @PatchMapping("/courses/{courseId}")
    public ResponseEntity<TeacherCourseResponse> updateCourse(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId,
            @RequestBody CourseUpdateRequest request) {
        requireTeacher(user);
        return ResponseEntity.ok(teacherCourseService.updateCourse(courseId, request, user.getId()));
    }

    @Operation(summary = "강의 삭제")
    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<Void> deleteCourse(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId) {
        requireTeacher(user);
        teacherCourseService.deleteCourse(courseId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "영상 추가")
    @PostMapping("/courses/{courseId}/lectures")
    public ResponseEntity<TeacherCourseResponse.LectureItem> addLecture(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId,
            @Valid @RequestBody LectureAddRequest request) {
        requireTeacher(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teacherCourseService.addLecture(courseId, request, user.getId()));
    }

    @Operation(summary = "영상 순서 변경")
    @PatchMapping("/courses/{courseId}/lectures/{lectureId}")
    public ResponseEntity<TeacherCourseResponse.LectureItem> updateLectureSequence(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId,
            @PathVariable Long lectureId,
            @Valid @RequestBody LectureUpdateRequest request) {
        requireTeacher(user);
        return ResponseEntity.ok(teacherCourseService.updateLectureSequence(courseId, lectureId, request, user.getId()));
    }

    @Operation(summary = "영상 삭제")
    @DeleteMapping("/courses/{courseId}/lectures/{lectureId}")
    public ResponseEntity<Void> deleteLecture(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId,
            @PathVariable Long lectureId) {
        requireTeacher(user);
        teacherCourseService.deleteLecture(courseId, lectureId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "통계 조회")
    @GetMapping("/stats")
    public ResponseEntity<List<CourseStatsResponse>> getStats(@AuthenticationPrincipal User user) {
        requireTeacher(user);
        return ResponseEntity.ok(teacherCourseService.getStats(user.getId()));
    }

    @Operation(summary = "날짜별 수강생 증가 추이")
    @GetMapping("/stats/daily-enrollments")
    public ResponseEntity<List<DailyEnrollmentResponse>> getDailyEnrollments(
            @AuthenticationPrincipal User user
    ) {
        requireTeacher(user);
        return ResponseEntity.ok(teacherCourseService.getDailyEnrollments(user.getId()));
    }

    @Operation(summary = "수강생 목록 조회")
    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<StudentProgressResponse>> getStudents(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId) {
        requireTeacher(user);
        return ResponseEntity.ok(teacherCourseService.getStudents(courseId, user.getId()));
    }

    @Operation(summary = "강의 리뷰 조회 (강사용)")
    @GetMapping("/courses/{courseId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getCourseReviews(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId) {
        requireTeacher(user);
        teacherCourseService.getCourse(courseId, user.getId());
        return ResponseEntity.ok(reviewService.getReviews(courseId));
    }

    private void requireLogin(User user) {
        if (user == null) throw new BusinessException(ErrorCode.FORBIDDEN);
    }

    private void requireTeacher(User user) {
        requireLogin(user);
        if (user.getRole() != User.Role.TEACHER) {
            throw new BusinessException(ErrorCode.NOT_TEACHER);
        }
    }
}