package rlaxogh76.DevClass.domain.admin.dto;

public record BulkEmailRequest(
        String subject,
        String content,
        String target   // ALL, STUDENT, TEACHER
) {}
