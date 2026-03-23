package rlaxogh76.DevClass.domain.review.repository;

import rlaxogh76.DevClass.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.course.id = :courseId")
    BigDecimal findAverageRatingByCourseId(@Param("courseId") Long courseId);

    List<Review> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Review> findByIdAndUserId(Long reviewId, Long userId);

    int countByCourseId(Long courseId);
}