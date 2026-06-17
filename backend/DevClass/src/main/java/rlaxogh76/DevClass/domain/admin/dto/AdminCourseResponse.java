package rlaxogh76.DevClass.domain.admin.dto;

import rlaxogh76.DevClass.domain.course.entity.Course;
import java.time.LocalDateTime;

public record AdminCourseResponse(
        Long id,
        String title,
        String teacherName,
        long price,
        boolean published,
        int lectureCount,
        LocalDateTime createdAt
) {
    public static AdminCourseResponse from(Course course) {
        return new AdminCourseResponse(
                course.getId(),
                course.getTitle(),
                course.getTeacher().getName(),
                course.getPrice(),
                course.isPublished(),
                course.getLectures().size(),
                course.getCreatedAt()
        );
    }
}
