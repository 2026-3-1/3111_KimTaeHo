package rlaxogh76.DevClass.domain.teacher.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LectureAddRequest(
        @NotBlank String title,
        @NotBlank String videoUrl,
        @NotNull @Min(0) Integer duration,
        @NotNull Integer sequence
) {}