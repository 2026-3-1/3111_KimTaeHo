package rlaxogh76.DevClass.domain.review.service;

import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.enrollment.repository.EnrollmentRepository;
import rlaxogh76.DevClass.domain.review.dto.ReviewRequest;
import rlaxogh76.DevClass.domain.review.dto.ReviewResponse;
import rlaxogh76.DevClass.domain.review.dto.ReviewUpdateRequest;
import rlaxogh76.DevClass.domain.review.entity.Review;
import rlaxogh76.DevClass.domain.review.repository.ReviewRepository;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    /** 강의 리뷰 목록 조회 */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviews(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new BusinessException(ErrorCode.COURSE_NOT_FOUND);
        }
        return reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    /**
     * 리뷰 작성
     * - 수강 중인 강의에만 작성 가능
     * - 강의당 1개만 작성 가능
     * TODO: 로그인 개발 완료 후 userId를 request 대신 파라미터로 분리
     */
    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        Long userId = request.userId();

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        var course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

        // 수강 여부 검증
        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, request.courseId())) {
            throw new BusinessException(ErrorCode.NOT_ENROLLED);
        }

        // 중복 리뷰 검증
        if (reviewRepository.existsByUserIdAndCourseId(userId, request.courseId())) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review review = Review.builder()
                .user(user)
                .course(course)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        return ReviewResponse.from(reviewRepository.save(review));
    }

    /**
     * 리뷰 수정
     * - 본인 리뷰만 수정 가능
     * TODO: 로그인 개발 완료 후 userId를 request 대신 파라미터로 분리
     */
    @Transactional
    public ReviewResponse update(Long reviewId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, request.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_AUTHORIZED));

        review.update(request.rating(), request.comment());
        return ReviewResponse.from(review);
    }

    /**
     * 리뷰 삭제
     * - 본인 리뷰만 삭제 가능
     * TODO: 로그인 개발 완료 후 userId를 RequestParam 대신 파라미터로 분리
     */
    @Transactional
    public void delete(Long reviewId, Long userId) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_AUTHORIZED));

        reviewRepository.delete(review);
    }
}