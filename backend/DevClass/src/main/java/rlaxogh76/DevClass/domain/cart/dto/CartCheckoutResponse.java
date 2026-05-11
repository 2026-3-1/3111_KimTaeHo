package rlaxogh76.DevClass.domain.cart.dto;

import java.util.List;

public record CartCheckoutResponse(
        int requestedCount,
        int successCount,
        int failedCount,
        List<Long> enrolledCourseIds,
        List<Long> failedCourseIds
) {
}
