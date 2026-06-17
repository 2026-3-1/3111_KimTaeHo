package rlaxogh76.DevClass.domain.admin.dto;

import rlaxogh76.DevClass.domain.payment.entity.Payment;
import java.time.LocalDateTime;

public record AdminPaymentResponse(
        Long id,
        String orderId,
        Long userId,
        Long amount,
        String status,
        String courseIds,
        LocalDateTime createdAt,
        LocalDateTime refundedAt
) {
    public static AdminPaymentResponse from(Payment payment) {
        return new AdminPaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getUserId(),
                payment.getAmount(),
                payment.getStatus().name(),
                payment.getCourseIds(),
                payment.getCreatedAt(),
                payment.getRefundedAt()
        );
    }
}
