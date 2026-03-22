package rlaxogh76.DevClass.domain.enrollment.dto;

import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;

public record MyEnrollmentResponse(
        Long enrollmentId,
        Long courseId,
        String courseTitle,
        Integer coursePrice,
        String teacherName,
        Integer totalProgress,
        String lastWatchedLectureTitle
) {
    public static MyEnrollmentResponse from(Enrollment enrollment) {
        String lastTitle = enrollment.getLastWatchedLecture() != null
                ? enrollment.getLastWatchedLecture().getTitle()
                : null;

        return new MyEnrollmentResponse(
                enrollment.getId(),
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getPrice(),
                enrollment.getCourse().getTeacher().getEmail(),
                enrollment.getTotalProgress(),
                lastTitle
        );
    }
}