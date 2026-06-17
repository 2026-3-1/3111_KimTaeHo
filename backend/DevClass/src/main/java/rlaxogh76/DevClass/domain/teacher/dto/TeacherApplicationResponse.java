package rlaxogh76.DevClass.domain.teacher.dto;

import rlaxogh76.DevClass.domain.teacher.entity.TeacherApplication;

import java.time.LocalDateTime;

public record TeacherApplicationResponse(
    Long id,
    Long userId,
    String userName,
    String userEmail,
    String phone,
    String introduction,
    String status,
    LocalDateTime createdAt,
    LocalDateTime reviewedAt,
    String rejectReason
) {
    public static TeacherApplicationResponse from(TeacherApplication a) {
        return new TeacherApplicationResponse(
            a.getId(),
            a.getUser().getId(),
            a.getUser().getName(),
            a.getUser().getEmail(),
            a.getPhone(),
            a.getIntroduction(),
            a.getStatus().name(),
            a.getCreatedAt(),
            a.getReviewedAt(),
            a.getRejectReason()
        );
    }
}
