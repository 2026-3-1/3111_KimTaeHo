package rlaxogh76.DevClass.domain.teacher.dto;

import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.entity.Lecture;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public record TeacherCourseResponse(
        Long id,
        String title,
        String description,
        Integer price,
        String category,
        String level,
        String coverImageUrl,
        BigDecimal averageRating,
        Integer enrollmentCount,
        LocalDateTime createdAt,
        List<LectureItem> lectures
) {
    public record LectureItem(
            Long id,
            String title,
            String videoUrl,
            Integer duration,
            Integer sequence
    ) {
        public static LectureItem from(Lecture l) {
            return new LectureItem(l.getId(), l.getTitle(), l.getVideoUrl(), l.getDuration(), l.getSequence());
        }
    }

    public static TeacherCourseResponse from(Course course) {
        List<LectureItem> lectureItems = course.getLectures().stream()
                .sorted(Comparator.comparingInt(Lecture::getSequence))
                .map(LectureItem::from)
                .toList();
        return new TeacherCourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getPrice(),
                course.getCategory(),
                course.getLevel(),
                course.getCoverImageUrl(),
                course.getAverageRating(),
                course.getEnrollmentCount(),
                course.getCreatedAt(),
                lectureItems
        );
    }
}