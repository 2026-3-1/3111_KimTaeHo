package rlaxogh76.DevClass.domain.course.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lectures")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String videoUrl;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private Integer sequence;

    public void updateSequence(Integer sequence) {
        if (sequence != null) this.sequence = sequence;
    }
}