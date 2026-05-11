package rlaxogh76.DevClass.domain.payment.dto;

public record PaymentOrderResponse(
        String orderId,
        long amount,
        String orderName,
        String customerName
) {}
