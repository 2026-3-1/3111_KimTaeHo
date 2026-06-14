package rlaxogh76.DevClass.domain.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rlaxogh76.DevClass.domain.payment.entity.Payment;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(String orderId);
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
