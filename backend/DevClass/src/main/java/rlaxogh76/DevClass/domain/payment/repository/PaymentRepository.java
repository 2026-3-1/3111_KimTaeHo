package rlaxogh76.DevClass.domain.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rlaxogh76.DevClass.domain.payment.entity.Payment;
import rlaxogh76.DevClass.domain.payment.entity.PaymentStatus;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(String orderId);
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT p FROM Payment p WHERE p.status IN :statuses AND (p.courseIds = :courseId OR p.courseIds LIKE CONCAT(:courseId, ',%') OR p.courseIds LIKE CONCAT('%,', :courseId, ',%') OR p.courseIds LIKE CONCAT('%,', :courseId))")
    List<Payment> findActiveByCourseId(@Param("courseId") String courseId, @Param("statuses") java.util.List<PaymentStatus> statuses);
}
