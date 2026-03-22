package rlaxogh76.DevClass.domain.course.repository;

import rlaxogh76.DevClass.domain.course.entity.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    List<Lecture> findByCourseIdOrderBySequenceAsc(Long courseId);
    int countByCourseId(Long courseId);
}