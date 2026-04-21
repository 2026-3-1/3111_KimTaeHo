package rlaxogh76.DevClass.domain.enrollment.repository;

import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    Optional<Enrollment> findByIdAndUserId(Long enrollmentId, Long userId);

    @Query("""
        SELECT e FROM Enrollment e
        JOIN FETCH e.course c
        JOIN FETCH c.teacher
        LEFT JOIN FETCH e.lastWatchedLecture
        WHERE e.user.id = :userId
        """)
    List<Enrollment> findAllByUserIdWithDetails(@Param("userId") Long userId);

    @Query("""
        SELECT e FROM Enrollment e
        JOIN FETCH e.user u
        WHERE e.course.id = :courseId
        """)
    List<Enrollment> findByCourseIdWithUser(@Param("courseId") Long courseId);

    int countByCourseId(Long courseId);

    void deleteByCourseId(Long courseId);

    @Query("""
        SELECT DATE(e.enrolledAt), COUNT(e)
        FROM Enrollment e
        WHERE e.course.teacher.id = :teacherId
        GROUP BY DATE(e.enrolledAt)
        ORDER BY DATE(e.enrolledAt) ASC
        """)
    List<Object[]> countDailyEnrollmentsByTeacherId(@Param("teacherId") Long teacherId);
}