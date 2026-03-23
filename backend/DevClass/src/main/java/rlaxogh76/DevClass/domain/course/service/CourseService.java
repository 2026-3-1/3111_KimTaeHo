package rlaxogh76.DevClass.domain.course.service;

import rlaxogh76.DevClass.domain.course.dto.*;
import rlaxogh76.DevClass.domain.course.entity.Course;
import rlaxogh76.DevClass.domain.course.repository.CourseRepository;
import rlaxogh76.DevClass.domain.course.repository.CourseSpecification;
import rlaxogh76.DevClass.domain.course.repository.LectureRepository;
import rlaxogh76.DevClass.domain.review.repository.ReviewRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;
    private final ReviewRepository reviewRepository;

    /** 강의 목록 조회 + 필터링 */
    public CoursePageResponse getCourses(CourseFilterRequest req) {
        Specification<Course> spec = CourseSpecification.filter(req);
        Sort sort = buildSort(req.getSort());
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);

        Page<CourseListResponse> result = courseRepository
                .findAll(spec, pageable)
                .map(CourseListResponse::from);

        return new CoursePageResponse(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements()
        );
    }

    /** 강의 상세 조회 */
    public CourseDetailResponse getCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

        int lectureCount = lectureRepository.countByCourseId(courseId);
        int reviewCount  = reviewRepository.countByCourseId(courseId);

        return CourseDetailResponse.of(
                course,
                lectureCount,
                course.getAverageRating(),  // Course 엔티티 캐싱값 사용 (별도 AVG 쿼리 제거)
                reviewCount
        );
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

    // -------------------------------------------------------
    // private
    // -------------------------------------------------------

    private Sort buildSort(String sortType) {
        if (sortType == null || sortType.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "id");
        }
        if (sortType.equals("popular"))    return Sort.by(Sort.Direction.DESC, "enrollmentCount");
        if (sortType.equals("rating"))     return Sort.by(Sort.Direction.DESC, "averageRating");
        if (sortType.equals("price_asc"))  return Sort.by(Sort.Direction.ASC,  "price");
        if (sortType.equals("price_desc")) return Sort.by(Sort.Direction.DESC, "price");
        return Sort.by(Sort.Direction.DESC, "id");
    }
}