package rlaxogh76.DevClass.domain.auth.dto;

import rlaxogh76.DevClass.domain.user.entity.User;
import java.time.LocalDate;

public record SignupResponse(
        Long id,
        String email,
        String role,
        LocalDate createdAt
) {
    public static SignupResponse from(User user) {
        return new SignupResponse(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt().toLocalDate()
        );
    }
}