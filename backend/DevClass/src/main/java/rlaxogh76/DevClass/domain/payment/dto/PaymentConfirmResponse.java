package rlaxogh76.DevClass.domain.payment.dto;

import java.util.List;

public record PaymentConfirmResponse(
        int enrolledCount,
        List<Long> enrolledCourseIds
) {}
