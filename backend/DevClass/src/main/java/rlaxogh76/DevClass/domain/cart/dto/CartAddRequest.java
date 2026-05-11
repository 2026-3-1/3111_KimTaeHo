package rlaxogh76.DevClass.domain.cart.dto;

import jakarta.validation.constraints.NotNull;

public record CartAddRequest(
        @NotNull Long userId,
        @NotNull Long courseId
) {
}
