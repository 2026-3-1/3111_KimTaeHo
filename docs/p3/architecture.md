# P3 아키텍처 설계

## 전체 구성도

```
┌─────────────────────────────────────────────────────────────────┐
│                        클라이언트 (React)                         │
│  Lazy Load / Code Splitting / Nginx gzip                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTPS (80/443)
┌─────────────────▼───────────────────────────────────────────────┐
│                    Spring Boot 4.0 (EC2)                         │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  REST API   │  │   Scheduler  │  │      AOP Audit Log      │ │
│  │  Controller │  │  (cron jobs) │  │  (@Before/@AfterReturning│ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────────┘ │
│         │                │                                        │
│  ┌──────▼────────────────▼──────────────────────────────────┐   │
│  │                   Service Layer                            │   │
│  │  PaymentService  SchedulerService  EnrollmentService      │   │
│  └──────┬─────────────────────────────────────────────────┬─┘   │
│         │                                                 │      │
│  ┌──────▼──────┐  ┌──────────────┐  ┌───────────────────▼──┐   │
│  │TossPayment  │  │  EmailService │  │    DiscordService     │   │
│  │Client       │  │ (RetryTemplate│  │  (RetryTemplate)      │   │
│  │(@Retryable) │  │  Spring Mail) │  │  (HttpClient)         │   │
│  └──────┬──────┘  └──────────────┘  └───────────────────────┘   │
│         │                                                         │
│  ┌──────▼──────────────────────────────────────────────────┐    │
│  │              JPA Repository Layer                         │    │
│  │  PaymentRepo  EnrollmentRepo  JobLogRepo  CourseRepo     │    │
│  └──────┬──────────────────────────────────────────────────┘    │
│         │                                                         │
│  ┌──────▼──────────────────────────────────────────────────┐    │
│  │                 MySQL 8.0 (Docker)                        │    │
│  │  payments  enrollments  job_logs  courses  users         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Observability Stack                                      │    │
│  │  Actuator(/health, /metrics, /prometheus)                 │    │
│  │  Sentry (sentry-logback, ERROR 자동 수집)                 │    │
│  │  Logback (구조화 로그, 레벨별 프리픽스)                    │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
          │                         │
 ┌────────▼──────┐       ┌──────────▼──────┐
 │ Toss Payments │       │  Gmail SMTP /    │
 │ API           │       │  Discord Webhook  │
 └───────────────┘       └──────────────────┘
```

---

## 재시도(Retry) 정책 흐름

```
클라이언트 결제 요청
     │
     ▼
PaymentService.confirmPayment()
     │
     ├── 멱등성 체크: PAID 상태? → 즉시 반환 (중복 방지)
     │
     ▼
TossPaymentClient.confirmPayment()   ← @Retryable
     │
     ├── 1차 시도 실패 (IOException) → 1초 대기 → 재시도
     ├── 2차 시도 실패 (IOException) → 2초 대기 → 재시도
     ├── 3차 시도 실패 (IOException) → BusinessException 전파
     └── 성공 → payment.confirm() → 수강 등록 → 알림 발송
```

---

## 스케줄러 / 배치 흐름

```
매일 00:00 (cron)
     │
     ▼
SchedulerService.sendProgressReminders()
     │
     ├── JobLogService.start() → job_logs INSERT (REQUIRES_NEW 트랜잭션)
     ├── EnrollmentRepository.findLowProgressEnrollments()
     ├── 대상별 EmailService.sendProgressReminder() (Async + Retry)
     └── JobLogService.success/fail() → job_logs UPDATE (REQUIRES_NEW 트랜잭션)
```

---

## CI/CD 파이프라인

```
git push → main
     │
     ▼
GitHub Actions CI (ci.yml)
  ├── Backend: ./gradlew test
  └── Frontend: npm run build
     │
     ▼ (CI 통과 시)
GitHub Actions CD (cd.yml)
  ├── Docker build & push (backend + frontend)
  └── SSH → EC2
        ├── .env 갱신
        ├── docker compose pull
        └── docker compose up -d
```

---

## 환경변수 관리 전략

| 환경 | 방법 | 저장 위치 |
|------|------|-----------|
| 로컬 개발 | `.env` 파일 | 로컬 (`.gitignore`) |
| Docker Compose | `.env` 파일 → 컨테이너 주입 | 서버 로컬 |
| GitHub Actions | GitHub Secrets | GitHub (암호화) |
| EC2 | SSH 배포 스크립트로 `.env` 동적 생성 | 서버 로컬 |
