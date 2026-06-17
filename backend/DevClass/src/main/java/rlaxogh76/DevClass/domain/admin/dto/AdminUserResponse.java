package rlaxogh76.DevClass.domain.admin.dto;

import rlaxogh76.DevClass.domain.user.entity.User;
import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String email,
        String name,
        String role,
        boolean active,
        LocalDateTime createdAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
