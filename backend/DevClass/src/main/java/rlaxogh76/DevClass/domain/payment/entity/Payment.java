package rlaxogh76.DevClass.domain.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true, length = 100)
    private String orderId;

    @Column(name = "payment_key", length = 200)
    private String paymentKey;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    // comma-separated course IDs (e.g. "1,3,7")
    @Column(name = "course_ids", nullable = false, columnDefinition = "TEXT")
    private String courseIds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @PrePersist
    protected void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public void confirm(String paymentKey) {
        this.paymentKey = paymentKey;
        this.status = PaymentStatus.PAID;
    }

    public void fail() {
        this.status = PaymentStatus.FAILED;
    }

    public void refund() {
        this.status = PaymentStatus.REFUNDED;
        this.refundedAt = LocalDateTime.now();
    }

    public void partialRefund(long cancelAmount) {
        this.amount = this.amount - cancelAmount;
        this.status = PaymentStatus.PARTIALLY_REFUNDED;
        this.refundedAt = LocalDateTime.now();
    }

    public boolean containsCourse(Long courseId) {
        if (courseIds == null) return false;
        for (String id : courseIds.split(",")) {
            if (id.trim().equals(String.valueOf(courseId))) return true;
        }
        return false;
    }

    public void removeCourseId(Long courseId) {
        if (courseIds == null) return;
        String updated = java.util.Arrays.stream(courseIds.split(","))
                .map(String::trim)
                .filter(id -> !id.equals(String.valueOf(courseId)))
                .collect(java.util.stream.Collectors.joining(","));
        this.courseIds = updated;
    }
}
