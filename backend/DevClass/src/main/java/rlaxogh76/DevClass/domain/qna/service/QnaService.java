package rlaxogh76.DevClass.domain.qna.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.qna.dto.AnswerRequest;
import rlaxogh76.DevClass.domain.qna.dto.QuestionRequest;
import rlaxogh76.DevClass.domain.qna.dto.QuestionResponse;
import rlaxogh76.DevClass.domain.qna.entity.Answer;
import rlaxogh76.DevClass.domain.qna.entity.Question;
import rlaxogh76.DevClass.domain.qna.repository.AnswerRepository;
import rlaxogh76.DevClass.domain.qna.repository.QuestionRepository;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QnaService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<QuestionResponse> getQuestions(Long courseId) {
        return questionRepository.findByCourseIdWithAnswers(courseId)
                .stream()
                .map(QuestionResponse::from)
                .toList();
    }

    public List<QuestionResponse> getTeacherQuestions(Long teacherId) {
        return questionRepository.findByTeacherIdWithAnswers(teacherId)
                .stream()
                .map(QuestionResponse::from)
                .toList();
    }

    @Transactional
    public QuestionResponse createQuestion(Long courseId, Long userId, QuestionRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Question question = Question.builder()
                .course(course)
                .author(author)
                .title(request.title())
                .content(request.content())
                .build();

        return QuestionResponse.from(questionRepository.save(question));
    }

    @Transactional
    public void deleteQuestion(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.QUESTION_NOT_FOUND));
        if (!question.getAuthor().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.QUESTION_NOT_AUTHORIZED);
        }
        questionRepository.delete(question);
    }

    @Transactional
    public QuestionResponse createAnswer(Long questionId, Long userId, AnswerRequest request) {
        Question question = questionRepository.findByIdWithAnswers(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.QUESTION_NOT_FOUND));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 강좌 담당 강사만 답변 가능
        if (!question.getCourse().getTeacher().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.ANSWER_NOT_AUTHORIZED);
        }

        Answer answer = Answer.builder()
                .question(question)
                .author(author)
                .content(request.content())
                .build();

        answerRepository.save(answer);

        return QuestionResponse.from(questionRepository.findByIdWithAnswers(questionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.QUESTION_NOT_FOUND)));
    }

    @Transactional
    public void deleteAnswer(Long answerId, Long userId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ANSWER_NOT_FOUND));
        if (!answer.getAuthor().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.ANSWER_NOT_AUTHORIZED);
        }
        answerRepository.delete(answer);
    }
}
