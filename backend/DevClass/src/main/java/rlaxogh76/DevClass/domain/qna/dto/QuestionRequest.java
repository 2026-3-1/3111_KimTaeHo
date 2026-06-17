package rlaxogh76.DevClass.domain.qna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuestionRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String content
) {}
