-- 계정 활성화 여부 컬럼 추가 (기존 회원은 모두 활성 상태로 설정)
ALTER TABLE users ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1;
