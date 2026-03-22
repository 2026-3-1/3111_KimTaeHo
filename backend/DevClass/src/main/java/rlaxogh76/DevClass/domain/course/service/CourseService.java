package rlaxogh76.DevClass.domain.course.service;

import rlaxogh76.DevClass.domain.course.dto.CourseDetailResponse;
import rlaxogh76.DevClass.domain.course.dto.CourseListResponse;
import rlaxogh76.DevClass.domain.course.dto.CoursePageResponse;
import rlaxogh76.DevClass.domain.course.dto.LectureResponse;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.course.repository.LectureRepository;
import rlaxogh76.DevClass.domain.review.repository.ReviewRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 강의 목록 조회
     * - keyword: 제목 기준 검색 (description 제외)
     * - category: 카테고리 필터
     * - level: 난이도 필터
     * - sort: price_asc | price_desc | rating | 기본값(최신순)
     */
    public CoursePageResponse getCourses(
            String keyword, String category, String level,
            int page, int size, String sort
    ) {
        String kw  = StringUtils.hasText(keyword)  ? keyword  : null;
        String cat = StringUtils.hasText(category) ? category : null;
        String lv  = StringUtils.hasText(level)    ? level    : null;

        Page<CourseListResponse> result;

        if ("rating".equals(sort)) {
            result = courseRepository
                    .searchCoursesSortByRating(kw, cat, lv, PageRequest.of(page - 1, size))
                    .map(CourseListResponse::from);
        } else {
            Sort sortOrder = switch (sort == null ? "" : sort) {
                case "price_asc"  -> Sort.by(Sort.Direction.ASC,  "price");
                case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
                default           -> Sort.by(Sort.Direction.DESC, "id");
            };
            result = courseRepository
                    .searchCourses(kw, cat, lv, PageRequest.of(page - 1, size, sortOrder))
                    .map(CourseListResponse::from);
        }

        return new CoursePageResponse(result.getContent(), page, size, result.getTotalElements());
    }

    /** 강의 상세 조회 */
    public CourseDetailResponse getCourse(Long courseId) {
        var course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));
        int lectureCount = lectureRepository.countByCourseId(courseId);
        double avgRating = reviewRepository.findAverageRatingByCourseId(courseId);
        int reviewCount  = reviewRepository.countByCourseId(courseId);
        return CourseDetailResponse.of(course, lectureCount, avgRating, reviewCount);
    }

    /** 강의 영상 목록 조회 */
    public List<LectureResponse> getLectures(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new BusinessException(ErrorCode.COURSE_NOT_FOUND);
        }
        return lectureRepository.findByCourseIdOrderBySequenceAsc(courseId)
                .stream()
                .map(LectureResponse::from)
                .toList();
    }
}