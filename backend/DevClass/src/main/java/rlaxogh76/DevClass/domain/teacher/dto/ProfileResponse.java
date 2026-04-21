package rlaxogh76.DevClass.domain.teacher.dto;

import rlaxogh76.DevClass.domain.user.entity.User;

public record ProfileResponse(
        Long id,
        String email,
        String name,
        String bio,
        String role
) {
    public static ProfileResponse from(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getName() != null ? user.getName() : "",
                user.getBio() != null ? user.getBio() : "",
                user.getRole().name()
        );
    }
}