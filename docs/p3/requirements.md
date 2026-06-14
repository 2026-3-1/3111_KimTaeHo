# P3 요구사항 명세

> Phase 3 (11~16주차) — 운영형/외부연동+관측성  
> 최종 발표: 2026-06-29 ~ 30

---

## 1. 외부 서비스 연동

| 항목 | 구현 방법 | 상태 |
|------|-----------|------|
| 알림 연동 (이메일) | Spring Mail + Gmail SMTP | ✅ 완료 |
| 알림 연동 (Discord Webhook) | Java HttpClient POST | ✅ 완료 |
| 외부 API 재시도 정책 | Spring Retry + ExponentialBackOffPolicy (3회, 1s→2s→4s) | ✅ 완료 |
| 멱등성 처리 | Payment.orderId unique 제약 + PAID 상태 조기 반환 | ✅ 완료 |

### 재시도 정책 상세
- **Toss Payments**: `@Retryable(retryFor={IOException, InterruptedException}, maxAttempts=3, backoff=1s×2.0)`
- **Discord / Email**: `RetryTemplate` (maxAttempts=3, 지수 백오프)
- **비재시도 대상**: `BusinessException` (비즈니스 로직 오류)

---

## 2. 배치/스케줄러

| 항목 | 구현 방법 | 상태 |
|------|-----------|------|
| 스케줄러 구현 | `@Scheduled` (cron) | ✅ 완료 |
| 진행률 리마인더 | 매일 자정, 진행률 30% 미만 + 7일 경과 학생 → 이메일 | ✅ 완료 |
| 주간 통계 알림 | 매주 월 09:00, 강사별 수강자 수 → Discord | ✅ 완료 |
| 작업 로그 테이블 | `job_logs` 테이블 (RUNNING→SUCCESS/FAILED) | ✅ 완료 |
| 배치 통합 테스트 | `SchedulerIntegrationTest` (H2 + MockitoBean) | ✅ 완료 |

---

## 3. 결제 모듈

| 항목 | 구현 방법 | 상태 |
|------|-----------|------|
| PG사 연동 | Toss Payments v1 API | ✅ 완료 |
| 결제 상태 관리 | PaymentStatus (PENDING→PAID/FAILED) | ✅ 완료 |
| 영수증 처리 | 이메일 + Discord 알림 | ✅ 완료 |

---

## 4. 운영 보안

| 항목 | 구현 방법 | 상태 |
|------|-----------|------|
| SQL Injection 방어 | Spring Data JPA 파라미터 바인딩 (`@Param`) | ✅ 완료 |
| XSS 방어 | Spring Security CSP 헤더 (`default-src 'self'`) | ✅ 완료 |
| 시크릿 관리 | 환경변수 (`.env`) / GitHub Secrets 분리 | ✅ 완료 |
| 외부 API 키 보안 | `TOSS_SECRET_KEY`, `DISCORD_WEBHOOK_URL` 환경변수화 | ✅ 완료 |

---

## 5. 관측성 (Observability)

| 항목 | 구현 방법 | 상태 |
|------|-----------|------|
| 구조화 로그 | SLF4J + Logback (`[AUDIT]`, `[Scheduler]`, `[Discord]` 프리픽스) | ✅ 완료 |
| 메트릭 수집 | Spring Actuator + Micrometer Prometheus | ✅ 완료 |
| 헬스체크 | `/actuator/health` (DB 포함) | ✅ 완료 |
| 에러 추적 | Sentry (sentry-logback, ERROR 레벨 자동 수집) | ✅ 완료 |
| AOP 감사 로그 | `AuditLogAspect` (결제·강좌·수강 이벤트) | ✅ 완료 |

---

## 6. 성능 최적화

| 항목 | 구현 방법 | 상태 |
|------|-----------|------|
| DB 인덱스 추가 | `add_performance_indexes.sql` (5개 인덱스) | ✅ 완료 |
| N+1 문제 해결 | JPQL FETCH JOIN (EnrollmentRepository) | ✅ 완료 |
| 프론트 코드 분할 | React.lazy() + Suspense (13개 페이지) | ✅ 완료 |
| 정적 자원 캐싱 | Nginx 1년 캐시 + gzip 압축 | ✅ 완료 |

---

## 7. CI/CD 배포 자동화

| 항목 | 구현 방법 | 상태 |
|------|-----------|------|
| CI 파이프라인 | `.github/workflows/ci.yml` (빌드+테스트+타입체크) | ✅ 완료 |
| CD 파이프라인 | `.github/workflows/cd.yml` (Docker Hub → EC2 배포) | ✅ 완료 |
| Docker 설정 | 멀티스테이지 빌드 (backend + frontend) | ✅ 완료 |
| 환경변수 분리 | GitHub Secrets → `.env` 동적 생성 | ✅ 완료 |
