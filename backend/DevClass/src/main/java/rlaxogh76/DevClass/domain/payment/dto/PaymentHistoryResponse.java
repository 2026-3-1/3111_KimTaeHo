package rlaxogh76.DevClass.domain.payment.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PaymentHistoryResponse(
        String orderId,
        long amount,
        String status,
        LocalDateTime createdAt,
        LocalDateTime refundedAt,
        List<CourseRefundInfo> courses,
        boolean refundEligible
) {
    public record CourseRefundInfo(
            long courseId,
            String courseTitle,
            int progress
    ) {}
}
