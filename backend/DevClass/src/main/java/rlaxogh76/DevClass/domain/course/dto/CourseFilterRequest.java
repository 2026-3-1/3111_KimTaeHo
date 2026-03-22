package rlaxogh76.DevClass.domain.course.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CourseFilterRequest {

    private String keyword;
    private String category;
    private String level;       // BEGINNER, INTERMEDIATE, ADVANCED
    private Integer minPrice;
    private Integer maxPrice;
    private Double minRating;
    private String sort;        // newest, popular, rating, price_asc, price_desc

    @Min(0)
    private int page = 0;

    @Min(1) @Max(100)
    private int size = 12;
}
