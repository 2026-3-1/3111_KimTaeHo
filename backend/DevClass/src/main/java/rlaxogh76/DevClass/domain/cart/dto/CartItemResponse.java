package rlaxogh76.DevClass.domain.cart.dto;

import rlaxogh76.DevClass.domain.cart.entity.CartItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CartItemResponse(
        Long cartItemId,
        Long courseId,
        String title,
        Integer price,
        String category,
        String level,
        BigDecimal averageRating,
        String teacherName,
        LocalDateTime addedAt,
        boolean alreadyEnrolled
) {
    public static CartItemResponse from(CartItem item, boolean alreadyEnrolled) {
        return new CartItemResponse(
                item.getId(),
                item.getCourse().getId(),
                item.getCourse().getTitle(),
                item.getCourse().getPrice(),
                item.getCourse().getCategory(),
                item.getCourse().getLevel(),
                item.getCourse().getAverageRating(),
                item.getCourse().getTeacher().getName(),
                item.getCreatedAt(),
                alreadyEnrolled
        );
    }
}
