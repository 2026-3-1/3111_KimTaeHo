package rlaxogh76.DevClass.domain.review.service;

import rlaxogh76.DevClass.domain.course.entity.Course;
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

import java.math.BigDecimal;
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

    /** 리뷰 작성 */
    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        Long userId = request.userId();

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        var course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, request.courseId())) {
            throw new BusinessException(ErrorCode.NOT_ENROLLED);
        }
        if (reviewRepository.existsByUserIdAndCourseId(userId, request.courseId())) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review review = Review.builder()
                .user(user)
                .course(course)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        reviewRepository.save(review);
        recalculateAverageRating(course);

        return ReviewResponse.from(review);
    }

    /** 리뷰 수정 */
    @Transactional
    public ReviewResponse update(Long reviewId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, request.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_AUTHORIZED));

        review.update(request.rating(), request.comment());
        recalculateAverageRating(review.getCourse());

        return ReviewResponse.from(review);
    }

    /** 리뷰 삭제 */
    @Transactional
    public void delete(Long reviewId, Long userId) {
        Review review = reviewRepository.findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_AUTHORIZED));

        Course course = review.getCourse();
        reviewRepository.delete(review);
        reviewRepository.flush();
        recalculateAverageRating(course);
    }

    // -------------------------------------------------------
    // private
    // -------------------------------------------------------

    private void recalculateAverageRating(Course course) {
        BigDecimal avg = reviewRepository.findAverageRatingByCourseId(course.getId());
        course.updateAverageRating(avg);
    }
}