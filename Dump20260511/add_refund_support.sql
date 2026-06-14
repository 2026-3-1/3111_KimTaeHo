-- 환불 기능 지원을 위한 payments 테이블 변경
-- 실행 전 반드시 백업할 것

ALTER TABLE payments
    ADD COLUMN refunded_at DATETIME NULL AFTER created_at;
