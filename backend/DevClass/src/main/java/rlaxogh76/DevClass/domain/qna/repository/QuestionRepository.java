package rlaxogh76.DevClass.domain.qna.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rlaxogh76.DevClass.domain.qna.entity.Question;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.course LEFT JOIN FETCH q.author LEFT JOIN FETCH q.answers a LEFT JOIN FETCH a.author WHERE q.course.id = :courseId ORDER BY q.createdAt DESC")
    List<Question> findByCourseIdWithAnswers(@Param("courseId") Long courseId);

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.answers WHERE q.id = :id")
    Optional<Question> findByIdWithAnswers(@Param("id") Long id);

    @Query("SELECT q FROM Question q JOIN FETCH q.author JOIN FETCH q.course ORDER BY q.createdAt DESC")
    List<Question> findAllWithAuthorAndCourse();

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.course LEFT JOIN FETCH q.author LEFT JOIN FETCH q.answers a LEFT JOIN FETCH a.author WHERE q.course.teacher.id = :teacherId ORDER BY q.createdAt DESC")
    List<Question> findByTeacherIdWithAnswers(@Param("teacherId") Long teacherId);
}
