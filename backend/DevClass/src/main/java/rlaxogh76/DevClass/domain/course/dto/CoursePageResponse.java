package rlaxogh76.DevClass.domain.course.dto;

import java.util.List;

public record CoursePageResponse(
        List<CourseListResponse> content,
        int page,
        int size,
        long totalElements
) {}