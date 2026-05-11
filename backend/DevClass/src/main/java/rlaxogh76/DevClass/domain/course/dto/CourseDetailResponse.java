package rlaxogh76.DevClass.domain.course.dto;

import rlaxogh76.DevClass.domain.course.entity.Course;

import java.math.BigDecimal;

public record CourseDetailResponse(
        Long id,
        String title,
        String description,
        Integer price,
        Long teacherId,
        String teacherName,
        String category,
        String level,
        String coverImageUrl,
        int lectureCount,
        BigDecimal averageRating,
        int reviewCount
) {
    public static CourseDetailResponse of(
            Course course,
            int lectureCount,
            BigDecimal averageRating,
            int reviewCount
    ) {
        return new CourseDetailResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getPrice(),
                course.getTeacher().getId(),
                course.getTeacher().getEmail(),
                course.getCategory(),
                course.getLevel(),
                course.getCoverImageUrl(),
                lectureCount,
                averageRating,
                reviewCount
        );
    }
}