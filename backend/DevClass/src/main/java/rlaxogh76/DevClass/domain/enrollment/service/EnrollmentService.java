package rlaxogh76.DevClass.domain.enrollment.service;

import rlaxogh76.DevClass.domain.course.entity.Lecture;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.course.repository.LectureRepository;
import rlaxogh76.DevClass.domain.enrollment.dto.EnrollmentRequest;
import rlaxogh76.DevClass.domain.enrollment.dto.EnrollmentResponse;
import rlaxogh76.DevClass.domain.enrollment.dto.MyEnrollmentResponse;
import rlaxogh76.DevClass.domain.enrollment.dto.ProgressUpdateRequest;
import rlaxogh76.DevClass.domain.enrollment.dto.ProgressUpdateResponse;
import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;
import rlaxogh76.DevClass.domain.enrollment.repository.EnrollmentRepository;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LectureRepository lectureRepository;

    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest request) {
        Long userId = request.userId();
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        var course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, request.courseId())) {
            throw new BusinessException(ErrorCode.ALREADY_ENROLLED);
        }
        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .totalProgress(0)
                .build();
        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    @Transactional(readOnly = true)
    public List<MyEnrollmentResponse> getMyEnrollments(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return enrollmentRepository.findAllByUserIdWithDetails(userId)
                .stream()
                .map(MyEnrollmentResponse::from)
                .toList();
    }

    @Transactional
    public void cancel(Long userId, Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findByIdAndUserId(enrollmentId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENROLLMENT_NOT_FOUND));
        if (enrollment.getTotalProgress() > 0) {
            throw new BusinessException(ErrorCode.CANNOT_CANCEL);
        }
        enrollmentRepository.delete(enrollment);
    }

    /**
     * 학습 진행률 저장
     * [검증 추가] 전달한 lectureId가 수강 중인 강의 소속인지 확인
     * → 다른 강의의 lectureId를 넘겨도 저장되던 버그 수정
     */
    @Transactional
    public ProgressUpdateResponse updateProgress(Long enrollmentId, ProgressUpdateRequest request) {
        Long userId = request.userId();
        Enrollment enrollment = enrollmentRepository.findByIdAndUserId(enrollmentId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENROLLMENT_NOT_FOUND));

        Lecture lecture = lectureRepository.findById(request.lastWatchedLectureId())
                .orElseThrow(() -> new BusinessException(ErrorCode.LECTURE_NOT_FOUND));

        // 강의 소속 검증
        if (!lecture.getCourse().getId().equals(enrollment.getCourse().getId())) {
            throw new BusinessException(ErrorCode.LECTURE_NOT_IN_COURSE);
        }

        enrollment.updateProgress(request.currentProgress(), lecture);
        return ProgressUpdateResponse.from(enrollment);
    }
}