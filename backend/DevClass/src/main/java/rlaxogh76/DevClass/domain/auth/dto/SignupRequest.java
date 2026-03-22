package rlaxogh76.DevClass.domain.auth.dto;

import rlaxogh76.DevClass.domain.user.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SignupRequest(
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotNull User.Role role
) {}