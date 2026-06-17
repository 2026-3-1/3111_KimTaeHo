package rlaxogh76.DevClass.domain.admin.dto;

import rlaxogh76.DevClass.domain.review.entity.Review;
import java.time.LocalDateTime;

public record AdminReviewResponse(
        Long id,
        String userName,
        String courseTitle,
        int rating,
        String comment,
        LocalDateTime createdAt
) {
    public static AdminReviewResponse from(Review review) {
        return new AdminReviewResponse(
                review.getId(),
                review.getUser().getName(),
                review.getCourse().getTitle(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
