# Portfolio — DevClass (김태호)

> 3개 프로젝트(P1~P3)로 구성된 온라인 강좌 플랫폼 풀스택 개발 포트폴리오

---

## 프로젝트 개요

**DevClass**는 강사가 강좌를 등록하고 학생이 수강·결제할 수 있는 온라인 교육 플랫폼입니다.  
Spring Boot 4 + React + MySQL 기반으로 설계부터 운영 자동화까지 혼자 구현했습니다.

- **기간**: 2026년 1월 ~ 6월 (16주)
- **역할**: 풀스택 개발 (백엔드, 프론트엔드, DevOps 전담)
- **데모**: http://3.38.185.147 (EC2 배포)
- **저장소**: https://github.com/rlaxogh76/3111_KimTaeHo

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **백엔드** | Spring Boot 4.0, Spring Security, Spring Data JPA, Spring Retry |
| **프론트엔드** | React 18, TypeScript, Vite, React Router, React Query |
| **데이터베이스** | MySQL 8.0 (JPA, N+1 방지 FETCH JOIN) |
| **인프라** | Docker, Docker Compose, EC2, GitHub Actions |
| **관측성** | Spring Actuator, Micrometer Prometheus, Sentry |
| **외부 연동** | Toss Payments, Gmail SMTP, Discord Webhook |

---

## P1 — 기초 도메인 구현 (1~6주차)

### 핵심 구현

- **JWT 인증**: Spring Security Filter 기반, Role(STUDENT/TEACHER) 분리 인가
- **강좌 CRUD**: 강사 강좌 등록/수정/삭제, 수강생 목록/상세 조회
- **수강 관리**: 수강 등록/취소, 진행률 업데이트 (강의 영상별)
- **리뷰 시스템**: 수강 완료 후 리뷰 작성 (진행률 80% 이상 조건)
- **장바구니**: 복수 강좌 담기, 주문 생성

### 주요 산출물
- 도메인 모델 설계 (ERD)
- REST API 명세 (Swagger)
- 보안 설정 (CORS, CSP, XSS 헤더)

---

## P2 — 기능 고도화 (7~10주차)

### 핵심 구현

- **결제 모듈**: Toss Payments 연동, 결제 상태 관리 (PENDING→PAID/FAILED)
- **YouTube 연동**: 영상 길이 자동 감지, 강의별 진행률 계산
- **강좌 필터링**: 카테고리/레벨/가격 범위 동적 필터 (JPA Specification)
- **코드 커버**: 강좌 커버 이미지 업로드 기능
- **보안 강화**: SQL Injection 방어 (JPA 파라미터 바인딩), Role 기반 API 접근 제어

### 주요 산출물
- 결제 흐름 설계서
- 보안 점검 체크리스트

---

## P3 — 운영형/외부연동+관측성 (11~16주차)

### 핵심 구현

#### 외부 서비스 연동
- **이중 알림 시스템**: Gmail SMTP(이메일) + Discord Webhook 동시 운영
- **재시도 정책**: Spring Retry `@Retryable` + `ExponentialBackOffPolicy` (3회, 1s→2s→4s)
- **멱등성 처리**: `payment.status == PAID` 조기 반환으로 중복 결제 방지

#### 배치/스케줄러
- **진행률 리마인더**: 매일 자정, 진행률 30% 미만 + 7일 경과 학생 → 이메일 발송
- **주간 통계 알림**: 매주 월요일 09:00, 강사별 수강자 수 → Discord 전송
- **작업 이력 관리**: `job_logs` 테이블 (RUNNING→SUCCESS/FAILED, `REQUIRES_NEW` 트랜잭션)
- **배치 통합 테스트**: `SchedulerIntegrationTest` (H2 인메모리 + MockitoBean)

#### 관측성
- **에러 추적**: Sentry (sentry-logback, ERROR 자동 수집)
- **메트릭**: Spring Actuator + Micrometer Prometheus (`/actuator/prometheus`)
- **AOP 감사 로그**: 결제·강좌·수강 이벤트 자동 기록

#### CI/CD
- **CI**: GitHub Actions (Java 테스트 + TypeScript 빌드)
- **CD**: Docker Hub → EC2 SSH 무중단 배포, 헬스체크 자동 검증
- **시크릿 관리**: GitHub Secrets → `.env` 동적 생성, 코드 저장소 노출 없음

### 주요 산출물
- [아키텍처 설계서](docs/p3/architecture.md)
- [배치 작업 명세서](docs/p3/job-spec.md)
- [운영 런북](docs/p3/runbook.md)
- [사고 보고서 샘플](docs/p3/incident-report-sample.md)
- [성능 최적화 기록](docs/p3/perf-notes.md)
- ADR 3개: [Toss 결제](docs/p3/adr/adr-001-toss-payments.md), [Spring Retry](docs/p3/adr/adr-002-spring-retry-backoff.md), [Sentry](docs/p3/adr/adr-003-sentry-observability.md)

---

## 기술 의사결정 기록 (ADR 요약)

| ADR | 결정 | 핵심 이유 |
|-----|------|----------|
| ADR-001 | Toss Payments 채택 | 현대적 REST API, 국내 간편결제, 완전한 샌드박스 |
| ADR-002 | Spring Retry + 지수 백오프 | 선언적 재시도 정책, Resilience4j보다 경량 |
| ADR-003 | Sentry (sentry-logback) | Spring Boot 버전 무관, 최소 코드 변경으로 에러 추적 |

---

## 회고 (Retrospective)

### 잘 한 것

- **단계적 설계**: P1→P3로 기능을 점진적으로 추가하며 각 단계를 견고하게 구현
- **운영 관점**: 코드 완성에 그치지 않고 재시도 정책, 멱등성, 장애 시나리오까지 고려
- **문서화**: ADR로 기술 선택 근거를 기록하여 미래의 결정을 설명 가능하게 유지
- **테스트**: 스케줄러 통합 테스트로 배치 작업의 정상 동작을 자동 검증

### 아쉬운 점

- **Circuit Breaker 미도입**: Toss API 장애 시 Circuit Breaker가 없어 사용자 대기 시간 길어짐
- **테스트 커버리지**: 핵심 서비스 로직의 단위 테스트가 부족
- **Redis 캐시 미적용**: 인기 강좌 목록 등 반복 쿼리에 캐시 레이어 없음

### 다음 단계

1. Resilience4j Circuit Breaker 도입 (결제 API)
2. Redis 캐시 레이어 (강좌 목록, 수강 통계)
3. Prometheus + Grafana 대시보드 구성
4. 테스트 커버리지 70% 이상 달성

---

## 연락처

- **GitHub**: https://github.com/rlaxogh76
- **이메일**: btm.email2769@gmail.com
