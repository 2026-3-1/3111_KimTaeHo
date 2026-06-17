package rlaxogh76.DevClass.domain.qna.dto;

import rlaxogh76.DevClass.domain.qna.entity.Answer;
import rlaxogh76.DevClass.domain.qna.entity.Question;

import java.time.LocalDateTime;
import java.util.List;

public record QuestionResponse(
        Long id,
        Long courseId,
        String courseTitle,
        String title,
        String content,
        String authorName,
        Long authorId,
        LocalDateTime createdAt,
        List<AnswerResponse> answers
) {
    public record AnswerResponse(
            Long id,
            String content,
            String authorName,
            Long authorId,
            LocalDateTime createdAt
    ) {
        public static AnswerResponse from(Answer a) {
            return new AnswerResponse(
                    a.getId(), a.getContent(),
                    a.getAuthor().getName(), a.getAuthor().getId(),
                    a.getCreatedAt()
            );
        }
    }

    public static QuestionResponse from(Question q) {
        List<AnswerResponse> answers = q.getAnswers().stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(AnswerResponse::from)
                .toList();
        return new QuestionResponse(
                q.getId(),
                q.getCourse().getId(), q.getCourse().getTitle(),
                q.getTitle(), q.getContent(),
                q.getAuthor().getName(), q.getAuthor().getId(),
                q.getCreatedAt(), answers
        );
    }
}
