package rlaxogh76.DevClass.domain.enrollment.entity;

import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.entity.Lecture;
import rlaxogh76.DevClass.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
        // 진행률은 감소하지 않음 — 이미 완료한 강의로 돌아가도 기존 진행률 유지
        if (progress > this.totalProgress) {
            this.totalProgress = progress;  //  더 클 때만 업데이트
        }
        this.lastWatchedLecture = lecture;  //  위치는 항상 업데이트
    }

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    @PrePersist
    protected void prePersist() {
        this.enrolledAt = LocalDateTime.now();
    }
}