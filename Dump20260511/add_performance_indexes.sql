-- 스케쥴러 쿼리 (findLowProgressEnrollments, findEnrollmentsSince) 성능 향상
CREATE INDEX idx_enrollments_enrolled_at
    ON enrollments (enrolled_at);

CREATE INDEX idx_enrollments_progress_enrolled
    ON enrollments (total_progress, enrolled_at);

-- 인기 순 정렬 (ORDER BY enrollment_count DESC) 성능 향상
CREATE INDEX idx_courses_enrollment_count
    ON courses (enrollment_count);

-- 결제 상태 조회 성능 향상
CREATE INDEX idx_payments_status
    ON payments (status);

CREATE INDEX idx_payments_user_status
    ON payments (user_id, status);
