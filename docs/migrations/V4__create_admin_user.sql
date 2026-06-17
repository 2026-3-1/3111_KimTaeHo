-- 관리자 계정 생성 (최초 1회만 실행)
-- password: Admin1234! (BCrypt 해시)
-- 배포 전 반드시 비밀번호를 변경하세요
INSERT INTO users (email, name, bio, password, role, created_at)
VALUES (
    'admin@devclass.com',
    '관리자',
    NULL,
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    NOW()
)
ON DUPLICATE KEY UPDATE email = email;
