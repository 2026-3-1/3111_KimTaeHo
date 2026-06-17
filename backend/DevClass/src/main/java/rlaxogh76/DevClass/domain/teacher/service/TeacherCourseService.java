package rlaxogh76.DevClass.domain.teacher.service;

import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.entity.Lecture;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.course.repository.LectureRepository;
import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;
import rlaxogh76.DevClass.domain.enrollment.repository.EnrollmentRepository;
import rlaxogh76.DevClass.domain.payment.entity.Payment;
import rlaxogh76.DevClass.domain.payment.entity.PaymentStatus;
import rlaxogh76.DevClass.domain.payment.repository.PaymentRepository;
import rlaxogh76.DevClass.domain.review.repository.ReviewRepository;
import rlaxogh76.DevClass.domain.teacher.dto.*;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import rlaxogh76.DevClass.global.notification.DiscordService;
import rlaxogh76.DevClass.global.notification.EmailService;
import rlaxogh76.DevClass.global.payment.TossPaymentClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherCourseService {

    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final TossPaymentClient tossPaymentClient;
    private final EmailService emailService;
    private final DiscordService discordService;

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

        emailService.sendCourseCreatedNotification(teacher.getEmail(), teacher.getName(), saved.getTitle());
        discordService.sendCourseCreatedAlert(teacher.getName(), saved.getTitle());

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
    public TeacherCourseResponse publishCourse(Long courseId, Long teacherId) {
        Course course = findCourseOwnedBy(courseId, teacherId);
        if (course.getLectures().isEmpty()) {
            throw new BusinessException(ErrorCode.COURSE_HAS_NO_LECTURES);
        }
        course.publish();
        return TeacherCourseResponse.from(course);
    }

    @Transactional
    public TeacherCourseResponse unpublishCourse(Long courseId, Long teacherId) {
        Course course = findCourseOwnedBy(courseId, teacherId);
        course.unpublish();
        return TeacherCourseResponse.from(course);
    }

    @Transactional
    public void deleteCourse(Long courseId, Long teacherId) {
        Course course = findCourseOwnedBy(courseId, teacherId);

        // 수강 중인 학생들에게 환불 처리 (PAID + PARTIALLY_REFUNDED 둘 다 검색)
        List<Payment> affectedPayments = paymentRepository.findActiveByCourseId(
                String.valueOf(courseId), List.of(PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED));

        for (Payment payment : affectedPayments) {
            if (!payment.containsCourse(courseId)) continue;

            User student = userRepository.findById(payment.getUserId()).orElse(null);
            if (student == null) continue;

            long courseIds = payment.getCourseIds().split(",").length;
            try {
                if (courseIds == 1) {
                    // 단일 강좌 결제 → 전액 환불
                    tossPaymentClient.cancelPayment(payment.getPaymentKey(), "강사의 강좌 폐강으로 인한 환불");
                    payment.refund();
                } else {
                    // 복수 강좌 결제 → 해당 강좌 금액만큼 부분 환불
                    long refundAmount = course.getPrice();
                    tossPaymentClient.cancelPartialPayment(payment.getPaymentKey(), "강사의 강좌 폐강으로 인한 부분 환불", refundAmount);
                    payment.removeCourseId(courseId);
                    payment.partialRefund(refundAmount);
                }
                emailService.sendCourseDeletedRefundNotification(
                        student.getEmail(), student.getName(), course.getTitle(),
                        courseIds == 1 ? payment.getAmount() : course.getPrice()
                );
            } catch (IOException | InterruptedException e) {
                log.error("[Course Delete] Toss 환불 실패 paymentKey={} courseId={}", payment.getPaymentKey(), courseId, e);
                // 환불 실패 시 삭제 중단 — 데이터 무결성 보장
                throw new BusinessException(ErrorCode.PAYMENT_CANCEL_FAILED);
            }
        }

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