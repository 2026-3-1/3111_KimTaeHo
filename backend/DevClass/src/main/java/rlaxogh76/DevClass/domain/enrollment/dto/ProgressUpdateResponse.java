package rlaxogh76.DevClass.domain.enrollment.dto;

import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;

public record ProgressUpdateResponse(
        Long enrollmentId,
        Integer progress
) {
    public static ProgressUpdateResponse from(Enrollment enrollment) {
        return new ProgressUpdateResponse(
                enrollment.getId(),
                enrollment.getTotalProgress()
        );
    }
}