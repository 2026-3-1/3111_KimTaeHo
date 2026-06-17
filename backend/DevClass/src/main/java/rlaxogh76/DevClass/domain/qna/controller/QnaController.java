package rlaxogh76.DevClass.domain.qna.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import rlaxogh76.DevClass.domain.qna.dto.AnswerRequest;
import rlaxogh76.DevClass.domain.qna.dto.QuestionRequest;
import rlaxogh76.DevClass.domain.qna.dto.QuestionResponse;
import rlaxogh76.DevClass.domain.qna.service.QnaService;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;

import java.util.List;

@Tag(name = "QnA", description = "강의 Q&A 게시판 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QnaController {

    private final QnaService qnaService;

    @Operation(summary = "질문 목록 조회")
    @GetMapping("/courses/{courseId}/questions")
    public ResponseEntity<List<QuestionResponse>> getQuestions(@PathVariable Long courseId) {
        return ResponseEntity.ok(qnaService.getQuestions(courseId));
    }

    @Operation(summary = "질문 작성 (수강생 전용)")
    @PostMapping("/courses/{courseId}/questions")
    public ResponseEntity<QuestionResponse> createQuestion(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody QuestionRequest request) {
        requireLogin(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(qnaService.createQuestion(courseId, user.getId(), request));
    }

    @Operation(summary = "질문 삭제 (작성자 본인)")
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long questionId,
            @AuthenticationPrincipal User user) {
        requireLogin(user);
        qnaService.deleteQuestion(questionId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "답변 작성 (담당 강사 전용)")
    @PostMapping("/questions/{questionId}/answers")
    public ResponseEntity<QuestionResponse> createAnswer(
            @PathVariable Long questionId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AnswerRequest request) {
        requireLogin(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(qnaService.createAnswer(questionId, user.getId(), request));
    }

    @Operation(summary = "답변 삭제 (작성자 본인)")
    @DeleteMapping("/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(
            @PathVariable Long answerId,
            @AuthenticationPrincipal User user) {
        requireLogin(user);
        qnaService.deleteAnswer(answerId, user.getId());
        return ResponseEntity.noContent().build();
    }

    private void requireLogin(User user) {
        if (user == null) throw new BusinessException(ErrorCode.FORBIDDEN);
    }
}
