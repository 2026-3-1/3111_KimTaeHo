-- job_logs 테이블: 배치/스케줄러 작업 실행 이력 관리
CREATE TABLE IF NOT EXISTS job_logs (
    id              BIGINT         NOT NULL AUTO_INCREMENT,
    job_name        VARCHAR(100)   NOT NULL COMMENT '작업 이름 (PROGRESS_REMINDER, WEEKLY_STATS 등)',
    status          VARCHAR(20)    NOT NULL COMMENT 'RUNNING | SUCCESS | FAILED',
    started_at      DATETIME       NOT NULL COMMENT '작업 시작 시각',
    completed_at    DATETIME       NULL     COMMENT '작업 완료 시각',
    processed_count INT            NOT NULL DEFAULT 0 COMMENT '처리된 레코드 수',
    error_message   TEXT           NULL     COMMENT '실패 시 오류 메시지',
    PRIMARY KEY (id),
    INDEX idx_job_logs_job_name (job_name),
    INDEX idx_job_logs_started_at (started_at),
    INDEX idx_job_logs_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
