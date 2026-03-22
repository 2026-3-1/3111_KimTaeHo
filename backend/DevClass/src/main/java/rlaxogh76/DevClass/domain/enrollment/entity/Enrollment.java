package rlaxogh76.DevClass.domain.enrollment.entity;

import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.entity.Lecture;
import rlaxogh76.DevClass.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "enrollments",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_enrollment",
                columnNames = {"user_id", "course_id"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "total_progress", nullable = false)
    @Builder.Default
    private Integer totalProgress = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_watched_lecture_id")
    private Lecture lastWatchedLecture;

    public void updateProgress(Integer progress, Lecture lecture) {
        this.totalProgress = progress;
        this.lastWatchedLecture = lecture;
    }
}