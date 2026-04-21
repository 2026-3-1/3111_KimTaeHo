package rlaxogh76.DevClass.domain.teacher.dto;

import rlaxogh76.DevClass.domain.course.entity.Course;

import java.math.BigDecimal;
import java.util.List;

public record CourseStatsResponse(
        Long courseId,
        String title,
        Integer enrollmentCount,
        BigDecimal averageRating,
        Integer reviewCount,
        Double avgProgress
) {
    public static CourseStatsResponse of(Course course, int reviewCount, Double avgProgress) {
        return new CourseStatsResponse(
                course.getId(),
                course.getTitle(),
                course.getEnrollmentCount(),
                course.getAverageRating(),
                reviewCount,
                avgProgress != null ? Math.round(avgProgress * 10.0) / 10.0 : 0.0
        );
    }
}