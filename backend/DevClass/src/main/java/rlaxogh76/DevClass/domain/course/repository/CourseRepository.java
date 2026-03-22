package rlaxogh76.DevClass.domain.course.repository;

import rlaxogh76.DevClass.domain.course.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query(
            value = """
            SELECT c FROM Course c
            JOIN FETCH c.teacher t
            WHERE (:keyword  IS NULL OR c.title LIKE %:keyword%)
              AND (:category IS NULL OR c.category = :category)
              AND (:level    IS NULL OR c.level    = :level)
            """,
            countQuery = """
            SELECT COUNT(c) FROM Course c
            WHERE (:keyword  IS NULL OR c.title LIKE %:keyword%)
              AND (:category IS NULL OR c.category = :category)
              AND (:level    IS NULL OR c.level    = :level)
            """
    )
    Page<Course> searchCourses(
            @Param("keyword")  String keyword,
            @Param("category") String category,
            @Param("level")    String level,
            Pageable pageable
    );

    @Query(
            value = """
            SELECT c FROM Course c
            JOIN FETCH c.teacher t
            WHERE (:keyword  IS NULL OR c.title LIKE %:keyword%)
              AND (:category IS NULL OR c.category = :category)
              AND (:level    IS NULL OR c.level    = :level)
            ORDER BY c.rating DESC
            """,
            countQuery = """
            SELECT COUNT(c) FROM Course c
            WHERE (:keyword  IS NULL OR c.title LIKE %:keyword%)
              AND (:category IS NULL OR c.category = :category)
              AND (:level    IS NULL OR c.level    = :level)
            """
    )
    Page<Course> searchCoursesSortByRating(
            @Param("keyword")  String keyword,
            @Param("category") String category,
            @Param("level")    String level,
            Pageable pageable
    );
}