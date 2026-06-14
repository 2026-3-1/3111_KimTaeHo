package rlaxogh76.DevClass.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailSendRequest(
        @Email @NotBlank String email
) {}
