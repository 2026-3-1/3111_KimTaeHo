package rlaxogh76.DevClass.domain.review.dto;

import rlaxogh76.DevClass.domain.review.entity.Review;
import java.time.LocalDateTime;

public record ReviewResponse(
        Long reviewId,
        Long courseId,
        Long userId,
        String userEmail,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getCourse().getId(),
                review.getUser().getId(),
                review.getUser().getEmail(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}