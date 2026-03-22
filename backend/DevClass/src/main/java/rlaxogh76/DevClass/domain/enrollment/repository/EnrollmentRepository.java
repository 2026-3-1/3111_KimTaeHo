package rlaxogh76.DevClass.domain.enrollment.repository;

import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Enrollment> findByIdAndUserId(Long enrollmentId, Long userId);

    // 수강 목록 조회 - course, teacher, lastWatchedLecture 한 번에 fetch (N+1 방지)
    @Query("""
        SELECT e FROM Enrollment e
        JOIN FETCH e.course c
        JOIN FETCH c.teacher
        LEFT JOIN FETCH e.lastWatchedLecture
        WHERE e.user.id = :userId
        """)
    List<Enrollment> findAllByUserIdWithDetails(@Param("userId") Long userId);
}