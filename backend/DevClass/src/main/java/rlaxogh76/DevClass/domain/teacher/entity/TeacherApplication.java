package rlaxogh76.DevClass.domain.teacher.entity;

import jakarta.persistence.*;
import lombok.*;
import rlaxogh76.DevClass.domain.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_applications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TeacherApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 1000)
    private String introduction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    private String rejectReason;

    public enum Status { PENDING, APPROVED, REJECTED }

    @PrePersist
    protected void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public TeacherApplication(User user, String phone, String introduction) {
        this.user = user;
        this.phone = phone;
        this.introduction = introduction;
        this.status = Status.PENDING;
    }

    public void approve() {
        this.status = Status.APPROVED;
        this.reviewedAt = LocalDateTime.now();
    }

    public void reject(String reason) {
        this.status = Status.REJECTED;
        this.rejectReason = reason;
        this.reviewedAt = LocalDateTime.now();
    }
}
