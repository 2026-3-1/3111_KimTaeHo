package rlaxogh76.DevClass.domain.course.dto;

import rlaxogh76.DevClass.domain.course.entity.Course;

public record CourseDetailResponse(
        Long id,
        String title,
        String description,
        Integer price,
        Long teacherId,
        String teacherName,
        String category,
        String level,
        int lectureCount,
        double averageRating,
        int reviewCount
) {
    public static CourseDetailResponse of(
            Course course,
            int lectureCount,
            double averageRating,
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
                lectureCount,
                averageRating,
                reviewCount
        );
    }
}