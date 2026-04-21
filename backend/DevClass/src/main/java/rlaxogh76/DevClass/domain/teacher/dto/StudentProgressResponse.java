package rlaxogh76.DevClass.domain.teacher.dto;

import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;

import java.time.LocalDateTime;

public record StudentProgressResponse(
        Long enrollmentId,
        Long userId,
        String userEmail,
        String userName,
        Integer totalProgress,
        LocalDateTime enrolledAt
) {
    public static StudentProgressResponse from(Enrollment enrollment) {
        return new StudentProgressResponse(
                enrollment.getId(),
                enrollment.getUser().getId(),
                enrollment.getUser().getEmail(),
                enrollment.getUser().getName() != null ? enrollment.getUser().getName() : "",
                enrollment.getTotalProgress(),
                enrollment.getEnrolledAt()
        );
    }
}