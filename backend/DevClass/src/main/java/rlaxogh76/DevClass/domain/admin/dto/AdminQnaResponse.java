package rlaxogh76.DevClass.domain.admin.dto;

import rlaxogh76.DevClass.domain.qna.entity.Question;
import java.time.LocalDateTime;

public record AdminQnaResponse(
        Long id,
        String authorName,
        String courseTitle,
        String title,
        int answerCount,
        LocalDateTime createdAt
) {
    public static AdminQnaResponse from(Question question) {
        return new AdminQnaResponse(
                question.getId(),
                question.getAuthor().getName(),
                question.getCourse().getTitle(),
                question.getTitle(),
                question.getAnswers().size(),
                question.getCreatedAt()
        );
    }
}
