package rlaxogh76.DevClass.domain.teacher.service;

import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.entity.Lecture;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.course.repository.LectureRepository;
import rlaxogh76.DevClass.domain.enrollment.repository.EnrollmentRepository;
import rlaxogh76.DevClass.domain.review.repository.ReviewRepository;
import rlaxogh76.DevClass.domain.teacher.dto.*;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherCourseService {

    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TeacherCourseResponse> getMyCourses(Long teacherId) {
        return courseRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId)
                .stream()
                .map(TeacherCourseResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TeacherCourseResponse getCourse(Long courseId, Long teacherId) {
        Course course = findCourseOwnedBy(courseId, teacherId);
        return TeacherCourseResponse.from(course);
    }

    @Transactional
    public TeacherCourseResponse createCourse(CourseCreateRequest request, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (teacher.getRole() != User.Role.TEACHER) {
            throw new BusinessException(ErrorCode.NOT_TEACHER);
        }

        Course course = Course.builder()
                .title(request.title())
                .description(request.description())
                .price(request.price())
                .category(request.category())
                .level(request.level())
                .coverImageUrl(request.coverImageUrl())
                .teacher(teacher)
                .build();

        Course saved = courseRepository.save(course);

        if (request.lectures() != null && !request.lectures().isEmpty()) {
            for (CourseCreateRequest.LectureItem item : request.lectures()) {
                Lecture lecture = Lecture.builder()
                        .course(saved)
                        .title(item.title())
                        .videoUrl(item.videoUrl())
                        .duration(item.duration())
                        .sequence(item.sequence())
                        .build();
                lectureRepository.save(lecture);
            }
        }

        Course withLectures = courseRepository.findById(saved.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));
        return TeacherCourseResponse.from(withLectures);
    }

    @Transactional
    public TeacherCourseResponse updateCourse(Long courseId, CourseUpdateRequest request, Long teacherId) {
        Course course = findCourseOwnedBy(courseId, teacherId);
        course.update(request.title(), request.description(), request.price(),
                request.category(), request.level(), request.coverImageUrl());
        return TeacherCourseResponse.from(course);
    }

    @Transactional
    public void deleteCourse(Long courseId, Long teacherId) {
        Course course = findCourseOwnedBy(courseId, teacherId);

        enrollmentRepository.deleteByCourseId(courseId);

        courseRepository.delete(course);
    }

    @Transactional(readOnly = true)
    public List<DailyEnrollmentResponse> getDailyEnrollments(Long teacherId) {
        return enrollmentRepository.countDailyEnrollmentsByTeacherId(teacherId)
                .stream()
                .map(row -> new DailyEnrollmentResponse(
                        row[0].toString(),          // DATE
                        ((Number) row[1]).longValue() // COUNT
                ))
                .toList();
    }

    @Transactional
    public TeacherCourseResponse.LectureItem addLecture(Long courseId, LectureAddRequest request, Long teacherId) {
        Course course = findCourseOwnedBy(courseId, teacherId);

        Lecture lecture = Lecture.builder()
                .course(course)
                .title(request.title())
                .videoUrl(request.videoUrl())
                .duration(request.duration())
                .sequence(request.sequence())
                .build();

        return TeacherCourseResponse.LectureItem.from(lectureRepository.save(lecture));
    }

    @Transactional
    public void deleteLecture(Long courseId, Long lectureId, Long teacherId) {
        findCourseOwnedBy(courseId, teacherId);
        Lecture lecture = lectureRepository.findById(lectureId)
                .filter(l -> l.getCourse().getId().equals(courseId))
                .orElseThrow(() -> new BusinessException(ErrorCode.LECTURE_NOT_FOUND_IN_COURSE));
        lectureRepository.delete(lecture);
    }

    @Transactional
    public TeacherCourseResponse.LectureItem updateLectureSequence(Long courseId, Long lectureId, LectureUpdateRequest request, Long teacherId) {
        findCourseOwnedBy(courseId, teacherId);
        Lecture lecture = lectureRepository.findById(lectureId)
                .filter(l -> l.getCourse().getId().equals(courseId))
                .orElseThrow(() -> new BusinessException(ErrorCode.LECTURE_NOT_FOUND_IN_COURSE));
        lecture.updateSequence(request.sequence());
        return TeacherCourseResponse.LectureItem.from(lecture);
    }

    @Transactional(readOnly = true)
    public List<CourseStatsResponse> getStats(Long teacherId) {
        List<Course> courses = courseRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);

        return courses.stream().map(course -> {
            int reviewCount = reviewRepository.countByCourseId(course.getId());
            Double avgProgress = enrollmentRepository.findByCourseIdWithUser(course.getId())
                    .stream()
                    .mapToInt(e -> e.getTotalProgress() != null ? e.getTotalProgress() : 0)
                    .average()
                    .orElse(0.0);
            return CourseStatsResponse.of(course, reviewCount, avgProgress);
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<StudentProgressResponse> getStudents(Long courseId, Long teacherId) {
        findCourseOwnedBy(courseId, teacherId);
        return enrollmentRepository.findByCourseIdWithUser(courseId)
                .stream()
                .map(StudentProgressResponse::from)
                .toList();
    }

    private Course findCourseOwnedBy(Long courseId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));
        if (!course.getTeacher().getId().equals(teacherId)) {
            throw new BusinessException(ErrorCode.COURSE_NOT_OWNED);
        }
        return course;
    }
}