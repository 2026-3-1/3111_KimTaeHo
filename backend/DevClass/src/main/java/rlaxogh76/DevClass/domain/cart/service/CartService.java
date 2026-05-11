package rlaxogh76.DevClass.domain.cart.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rlaxogh76.DevClass.domain.cart.dto.CartAddRequest;
import rlaxogh76.DevClass.domain.cart.dto.CartCheckoutResponse;
import rlaxogh76.DevClass.domain.cart.dto.CartItemResponse;
import rlaxogh76.DevClass.domain.cart.entity.CartItem;
import rlaxogh76.DevClass.domain.cart.repository.CartItemRepository;
import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.enrollment.dto.EnrollmentRequest;
import rlaxogh76.DevClass.domain.enrollment.repository.EnrollmentRepository;
import rlaxogh76.DevClass.domain.enrollment.service.EnrollmentService;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentService enrollmentService;

    @Transactional(readOnly = true)
    public List<CartItemResponse> getMyCart(Long userId) {
        validateStudent(userId);

        List<CartItem> items = cartItemRepository.findAllByUserIdWithCourse(userId);
        Set<Long> enrolledCourseIds = new HashSet<>(
                enrollmentRepository.findAllByUserIdWithDetails(userId)
                        .stream()
                        .map(e -> e.getCourse().getId())
                        .toList()
        );

        return items.stream()
                .map(item -> CartItemResponse.from(item, enrolledCourseIds.contains(item.getCourse().getId())))
                .toList();
    }

    @Transactional
    public CartItemResponse add(CartAddRequest request) {
        Long userId = request.userId();
        validateStudent(userId);

        Long courseId = request.courseId();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new BusinessException(ErrorCode.ALREADY_ENROLLED);
        }

        if (cartItemRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new BusinessException(ErrorCode.CART_ALREADY_EXISTS);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        CartItem saved = cartItemRepository.save(
                CartItem.builder()
                        .user(user)
                        .course(course)
                        .build()
        );

        return CartItemResponse.from(saved, false);
    }

    @Transactional
    public void remove(Long userId, Long courseId) {
        validateStudent(userId);

        CartItem item = cartItemRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND));

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clear(Long userId) {
        validateStudent(userId);
        cartItemRepository.deleteAllByUserId(userId);
    }

    @Transactional
    public CartCheckoutResponse checkout(Long userId) {
        validateStudent(userId);

        List<CartItem> items = cartItemRepository.findAllByUserIdWithCourse(userId);
        if (items.isEmpty()) {
            return new CartCheckoutResponse(0, 0, 0, List.of(), List.of());
        }

        int requestedCount = 0;
        int successCount = 0;
        int failedCount = 0;
        List<Long> enrolledCourseIds = new ArrayList<>();
        List<Long> failedCourseIds = new ArrayList<>();

        for (CartItem item : items) {
            Long courseId = item.getCourse().getId();

            if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
                cartItemRepository.delete(item);
                continue;
            }

            requestedCount++;
            try {
                enrollmentService.enroll(new EnrollmentRequest(userId, courseId));
                cartItemRepository.delete(item);
                successCount++;
                enrolledCourseIds.add(courseId);
            } catch (BusinessException e) {
                if (e.getErrorCode() == ErrorCode.ALREADY_ENROLLED) {
                    cartItemRepository.delete(item);
                    continue;
                }
                failedCount++;
                failedCourseIds.add(courseId);
            }
        }

        return new CartCheckoutResponse(
                requestedCount,
                successCount,
                failedCount,
                enrolledCourseIds,
                failedCourseIds
        );
    }

    private void validateStudent(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() != User.Role.STUDENT) {
            throw new BusinessException(ErrorCode.NOT_STUDENT);
        }
    }
}
