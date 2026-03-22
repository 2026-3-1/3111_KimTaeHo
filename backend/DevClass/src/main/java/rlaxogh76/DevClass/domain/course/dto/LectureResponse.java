package rlaxogh76.DevClass.domain.course.dto;

import rlaxogh76.DevClass.domain.course.entity.Lecture;

public record LectureResponse(
        Long id,
        String title,
        String videoUrl,
        Integer duration
) {
    public static LectureResponse from(Lecture lecture) {
        return new LectureResponse(
                lecture.getId(),
                lecture.getTitle(),
                lecture.getVideoUrl(),
                lecture.getDuration()
        );
    }
}