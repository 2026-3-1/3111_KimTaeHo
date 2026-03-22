package rlaxogh76.DevClass.domain.enrollment.dto;

import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;

public record EnrollmentResponse(
        Long enrollmentId,
        Long courseId,
        Long userId,
        Integer progress
) {
    public static EnrollmentResponse from(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getCourse().getId(),
                enrollment.getUser().getId(),
                enrollment.getTotalProgress()
        );
    }
}