package rlaxogh76.DevClass.domain.teacher.dto;

import jakarta.validation.constraints.NotNull;

public record LectureUpdateRequest(
        @NotNull Integer sequence
) {}
