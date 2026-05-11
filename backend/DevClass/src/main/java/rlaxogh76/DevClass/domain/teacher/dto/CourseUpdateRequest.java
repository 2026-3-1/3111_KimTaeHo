package rlaxogh76.DevClass.domain.teacher.dto;

import jakarta.validation.constraints.Min;

public record CourseUpdateRequest(
        String title,
        String description,
        @Min(0) Integer price,
        String category,
        String level,
        String coverImageUrl
) {}