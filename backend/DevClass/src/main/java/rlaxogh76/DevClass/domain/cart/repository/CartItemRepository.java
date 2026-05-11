package rlaxogh76.DevClass.domain.cart.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rlaxogh76.DevClass.domain.cart.entity.CartItem;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    Optional<CartItem> findByUserIdAndCourseId(Long userId, Long courseId);

    @Query("""
        SELECT ci FROM CartItem ci
        JOIN FETCH ci.course c
        JOIN FETCH c.teacher
        WHERE ci.user.id = :userId
        ORDER BY ci.createdAt DESC
        """)
    List<CartItem> findAllByUserIdWithCourse(@Param("userId") Long userId);

    void deleteAllByUserId(Long userId);
}
