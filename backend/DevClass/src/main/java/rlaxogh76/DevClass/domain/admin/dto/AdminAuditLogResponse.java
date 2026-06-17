package rlaxogh76.DevClass.domain.admin.dto;

import rlaxogh76.DevClass.domain.admin.entity.AdminAuditLog;

import java.time.LocalDateTime;

public record AdminAuditLogResponse(
        Long id,
        String email,
        String ip,
        String method,
        String uri,
        int status,
        LocalDateTime createdAt
) {
    public static AdminAuditLogResponse from(AdminAuditLog log) {
        return new AdminAuditLogResponse(
                log.getId(), log.getEmail(), log.getIp(),
                log.getMethod(), log.getUri(), log.getStatus(), log.getCreatedAt()
        );
    }
}
