package rlaxogh76.DevClass.domain.course.repository;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import rlaxogh76.DevClass.domain.course.dto.CourseFilterRequest;
import rlaxogh76.DevClass.domain.course.entity.Course;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class CourseSpecification {

    public static Specification<Course> filter(CourseFilterRequest req) {
        return Specification
                .where(likeKeyword(req.getKeyword()))
                .and(eqCategory(req.getCategory()))
                .and(eqLevel(req.getLevel()))
                .and(betweenPrice(req.getMinPrice(), req.getMaxPrice()))
                .and(minRating(req.getMinRating()));
    }

    private static Specification<Course> likeKeyword(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) return null;
            String pattern = "%" + keyword.trim() + "%";
            return cb.or(
                    cb.like(root.get("title"), pattern),
                    cb.like(root.get("description"), pattern)
            );
        };
    }

    private static Specification<Course> eqCategory(String category) {
        return (root, query, cb) ->
                StringUtils.hasText(category)
                        ? cb.equal(root.get("category"), category)
                        : null;
    }

    private static Specification<Course> eqLevel(String level) {
        return (root, query, cb) ->
                StringUtils.hasText(level)
                        ? cb.equal(root.get("level"), level)
                        : null;
    }

    private static Specification<Course> betweenPrice(Integer min, Integer max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            if (min == null) return cb.lessThanOrEqualTo(root.get("price"), max);
            if (max == null) return cb.greaterThanOrEqualTo(root.get("price"), min);
            return cb.between(root.get("price"), min, max);
        };
    }

    private static Specification<Course> minRating(Double minRating) {
        return (root, query, cb) ->
                minRating != null
                        ? cb.greaterThanOrEqualTo(root.get("averageRating"), minRating)
                        : null;
    }
}