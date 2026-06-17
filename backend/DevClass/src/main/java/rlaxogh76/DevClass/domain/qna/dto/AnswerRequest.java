package rlaxogh76.DevClass.domain.qna.dto;

import jakarta.validation.constraints.NotBlank;

public record AnswerRequest(@NotBlank String content) {}
