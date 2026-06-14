package rlaxogh76.DevClass.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailVerifyRequest(
        @Email @NotBlank String email,
        @NotBlank String code
) {}
