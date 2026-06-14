# 배치/스케줄러 작업 명세 (Job Spec)

## 개요

DevClass 플랫폼의 배치 작업은 Spring `@Scheduled` 기반 cron 작업으로 구현됩니다.  
모든 작업 실행 이력은 `job_logs` 테이블에 기록됩니다.

---

## 작업 목록

### JOB-001: 진행률 리마인더 (`PROGRESS_REMINDER`)

| 항목 | 내용 |
|------|------|
| **클래스** | `SchedulerService.sendProgressReminders()` |
| **실행 주기** | 매일 자정 (`0 0 0 * * *`) |
| **목적** | 진행률이 낮은 학생에게 학습 독려 이메일 발송 |
| **대상 조건** | `total_progress < 30%` AND `enrolled_at < 7일 전` |
| **처리 방식** | 대상 학생별 비동기(`@Async`) 이메일 발송 |
| **재시도** | 이메일 서비스: RetryTemplate (3회, 지수 백오프) |
| **알림** | 없음 (이메일 자체가 사용자 알림) |
| **실패 처리** | 개별 이메일 실패 시 로그 기록 후 다음 대상 진행 |

**실행 흐름:**
```
1. JobLog INSERT (status=RUNNING)
2. EnrollmentRepository.findLowProgressEnrollments(30, 7일전)
3. 대상별 EmailService.sendProgressReminder() (비동기)
4. JobLog UPDATE (status=SUCCESS, processedCount=N)
```

**쿼리:**
```sql
SELECT e FROM Enrollment e
JOIN FETCH e.user u
JOIN FETCH e.course c
WHERE e.totalProgress < :maxProgress   -- 30
AND e.enrolledAt < :before             -- now() - 7days
```

---

### JOB-002: 주간 수강 통계 (`WEEKLY_STATS`)

| 항목 | 내용 |
|------|------|
| **클래스** | `SchedulerService.sendWeeklyStats()` |
| **실행 주기** | 매주 월요일 오전 9시 (`0 0 9 * * MON`) |
| **목적** | 강사별 주간 신규 수강자 수를 Discord로 공유 |
| **대상 조건** | `enrolled_at >= 7일 전` |
| **처리 방식** | 강사별 집계 후 Discord Webhook POST |
| **재시도** | Discord 서비스: RetryTemplate (3회, 지수 백오프) |
| **알림** | Discord `#운영알림` 채널 |
| **실패 처리** | Discord 전송 실패 시 로그 기록, JobLog FAILED 마킹 |

**실행 흐름:**
```
1. JobLog INSERT (status=RUNNING)
2. EnrollmentRepository.findEnrollmentsSince(7일전)
3. 강사별 groupingBy 집계
4. DiscordService.sendWeeklyStatsAlert() (비동기)
5. JobLog UPDATE (status=SUCCESS, processedCount=N)
```

---

## `job_logs` 테이블 스키마

```sql
CREATE TABLE job_logs (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    job_name        VARCHAR(100) NOT NULL,   -- PROGRESS_REMINDER | WEEKLY_STATS
    status          VARCHAR(20)  NOT NULL,   -- RUNNING | SUCCESS | FAILED
    started_at      DATETIME     NOT NULL,
    completed_at    DATETIME     NULL,
    processed_count INT          NOT NULL DEFAULT 0,
    error_message   TEXT         NULL,
    PRIMARY KEY (id),
    INDEX idx_job_logs_job_name (job_name),
    INDEX idx_job_logs_started_at (started_at)
);
```

**상태 전이:**
```
RUNNING → SUCCESS  (정상 완료)
RUNNING → FAILED   (예외 발생)
```

---

## 트랜잭션 설계

| 메서드 | 트랜잭션 |
|--------|----------|
| `SchedulerService.*` | `@Transactional(readOnly=true)` — DB 읽기 전용 |
| `JobLogService.start()` | `@Transactional(REQUIRES_NEW)` — 즉시 커밋 |
| `JobLogService.success()` | `@Transactional(REQUIRES_NEW)` — 즉시 커밋 |
| `JobLogService.fail()` | `@Transactional(REQUIRES_NEW)` — 즉시 커밋 |

`REQUIRES_NEW`를 사용하는 이유: 스케줄러 트랜잭션이 롤백되더라도 작업 실패 로그는 반드시 기록되어야 하기 때문.

---

## 성능 고려사항

- **인덱스**: `idx_enrollments_enrolled_at`, `idx_enrollments_progress_enrolled` 적용
- **Fetch Join**: N+1 문제 방지 (`JOIN FETCH e.user`, `JOIN FETCH e.course`)
- **비동기 처리**: 알림 발송은 `@Async`로 별도 스레드 처리 → 스케줄러 블로킹 없음

---

## 모니터링

```bash
# 최근 10개 작업 이력 조회
SELECT job_name, status, started_at, completed_at, processed_count, error_message
FROM job_logs
ORDER BY started_at DESC
LIMIT 10;

# 실패한 작업 조회
SELECT * FROM job_logs WHERE status = 'FAILED' ORDER BY started_at DESC;
```
