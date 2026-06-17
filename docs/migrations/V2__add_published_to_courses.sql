-- 기존 강좌는 모두 발행 상태로 유지 (DEFAULT TRUE)
-- 이후 신규 생성되는 강좌는 Java 코드에서 published = false (비공개/임시저장) 상태로 시작
ALTER TABLE courses
    ADD COLUMN published TINYINT(1) NOT NULL DEFAULT 1
    COMMENT '발행 여부: 1=발행, 0=임시저장';

-- 강의 영상이 없는 기존 강좌는 비공개 처리
UPDATE courses
SET published = 0
WHERE id NOT IN (
    SELECT course_id FROM (SELECT DISTINCT course_id FROM lectures) AS tmp
);
