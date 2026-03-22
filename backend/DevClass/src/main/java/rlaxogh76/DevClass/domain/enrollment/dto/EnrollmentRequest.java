package rlaxogh76.DevClass.domain.enrollment.dto;

import jakarta.validation.constraints.NotNull;

/**
 * TODO: 로그인 개발 완료 후 userId 필드 제거,
 *       컨트롤러에서 @AuthenticationPrincipal로 userId 획득
 */
public record EnrollmentRequest(
        @NotNull Long userId,
        @NotNull Long courseId
) {}