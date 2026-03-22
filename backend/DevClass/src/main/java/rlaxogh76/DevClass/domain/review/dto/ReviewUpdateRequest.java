package rlaxogh76.DevClass.domain.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * TODO: 로그인 개발 완료 후 userId 필드 제거
 */
public record ReviewUpdateRequest(
        @NotNull Long userId,
        @NotNull @Min(1) @Max(5) Integer rating,
        String comment
) {}