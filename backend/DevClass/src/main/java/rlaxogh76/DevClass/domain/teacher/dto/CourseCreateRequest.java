package rlaxogh76.DevClass.domain.teacher.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CourseCreateRequest(
        @NotBlank String title,
        String description,
        @NotNull @Min(0) Integer price,
        @NotBlank String category,
        @NotBlank String level,
        String coverImageUrl,
        List<LectureItem> lectures
) {
    public record LectureItem(
            @NotBlank String title,
            @NotBlank String videoUrl,
            @NotNull @Min(0) Integer duration,
            @NotNull Integer sequence
    ) {}
}