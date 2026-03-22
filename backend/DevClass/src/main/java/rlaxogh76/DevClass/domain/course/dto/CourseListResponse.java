package rlaxogh76.DevClass.domain.course.dto;

import rlaxogh76.DevClass.domain.course.entity.Course;

public record CourseListResponse(
        Long id,
        String title,
        String description,
        Integer price,
        String teacherName,
        String category,
        String level,
        java.math.BigDecimal rating
) {
    public static CourseListResponse from(Course course) {
        return new CourseListResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getPrice(),
                course.getTeacher().getEmail(),
                course.getCategory(),
                course.getLevel(),
                course.getRating()
        );
    }
}