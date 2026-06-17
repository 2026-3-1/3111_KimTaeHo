# DevClass — 인터넷 강의 플랫폼 운영 매뉴얼

> **GitHub:** https://github.com/2026-3-1/3111_KimTaeHo

---

## 목차

1. [접속 주소](#1-접속-주소)
2. [관리자 계정](#2-관리자-계정)
3. [주요 기능 목록](#3-주요-기능-목록)
4. [Discord 알림 설정 및 확인](#4-discord-알림-설정-및-확인)
5. [이메일(SMTP) 설정 및 확인](#5-이메일smtp-설정-및-확인)
6. [배치 작업 확인](#6-배치-작업-확인)
7. [보안 기능 확인](#7-보안-기능-확인)
8. [로그 확인 방법](#8-로그-확인-방법)
9. [서버 상태 모니터링](#9-서버-상태-모니터링)
10. [배포 및 CI/CD](#10-배포-및-cicd)
11. [환경변수 목록](#11-환경변수-목록)
12. [장애 대응 가이드](#12-장애-대응-가이드)

---

## 1. 접속 주소

| 구분                   | URL                                                                          |
| ---------------------- | ---------------------------------------------------------------------------- |
| **일반 사용자 사이트** | `https://wrote-bridal-astrology-asylum.trycloudflare.com`                    |
| **관리자 페이지**      | `https://wrote-bridal-astrology-asylum.trycloudflare.com/admin`              |
| **백엔드 API**         | `https://wrote-bridal-astrology-asylum.trycloudflare.com/api`                |
| **Swagger UI**         | `https://wrote-bridal-astrology-asylum.trycloudflare.com/swagger-ui.html`    |
| **서버 헬스체크**      | `https://wrote-bridal-astrology-asylum.trycloudflare.com/actuator/health`    |

> EC2 직접 접속(SSH 등)은 `43.203.204.167` 사용

---

## 2. 관리자 계정

### 관리자 계정 최초 생성 방법

일반 회원가입으로는 ADMIN 권한을 부여받을 수 없습니다.  
**EC2 서버에서 아래 방법으로 최초 관리자 계정을 생성해야 합니다.**

#### 단계 1 — EC2에 SSH 접속

```bash
ssh ec2-user@43.203.204.167
```

#### 단계 2 — 먼저 사이트에서 일반 학생으로 회원가입

1. `https://wrote-bridal-astrology-asylum.trycloudflare.com/signup` 접속
2. 관리자로 사용할 이메일로 STUDENT 역할로 가입

#### 단계 3 — DB에서 역할을 ADMIN으로 변경

```bash
cd ~/devclass
docker compose exec db mysql -u${DB_USERNAME} -p${DB_PASSWORD} devclass
```

MySQL 프롬프트에서:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = '관리자이메일@example.com';
SELECT id, email, role FROM users WHERE email = '관리자이메일@example.com';
EXIT;
```

#### 단계 4 — 로그인 확인

`https://wrote-bridal-astrology-asylum.trycloudflare.com/login` 에서 해당 이메일/비밀번호로 로그인하면 `/admin` 페이지로 자동 이동됩니다.

> **주의:** DB에서 role을 ADMIN으로 변경한 후에는 **반드시 로그아웃 후 재로그인**해야 합니다.  
> 기존 JWT 토큰에는 변경 전 role이 담겨 있어 로그아웃 전까지 403이 계속 발생합니다.

---

> **주의:** 관리자 JWT 토큰은 보안 정책에 의해 **1시간 후 만료**됩니다.  
> 만료 시 자동으로 로그인 화면으로 이동되며, 재로그인이 필요합니다.

---

## 3. 주요 기능 목록

### 학생 기능

| 기능            | 설명                                         |
| --------------- | -------------------------------------------- |
| 회원가입/로그인 | 이메일 인증 후 가입 (STUDENT / TEACHER 선택) |
| 강의 목록·검색  | 카테고리, 난이도, 가격 필터                  |
| 강의 상세       | 강의 소개, 리뷰, Q&A 열람                    |
| 장바구니·결제   | 토스페이먼츠 연동                            |
| 수강 관리       | 진행률 추적, 마지막 시청 강의 저장           |
| 리뷰 작성       | 80% 이상 수강 후 작성 가능                   |
| Q&A             | 질문 등록, 강사 답변 확인                    |

### 강사 기능

| 기능                | 설명                                 |
| ------------------- | ------------------------------------ |
| 강의 등록·수정·삭제 | 영상 URL, 가격, 카테고리 설정        |
| 강의 발행/취소      | 영상이 1개 이상 있어야 발행 가능     |
| 수강생 관리         | 수강생 목록, 진행률 확인             |
| Q&A 답변            | 자신의 강의 질문에 답변              |
| 리뷰 열람           | 강의별 리뷰 확인                     |
| 통계                | 일별 수강생 추이, 강의별 평점·진행률 |

### 관리자 기능

| 기능             | 확인 위치                   |
| ---------------- | --------------------------- |
| 회원 관리        | `/admin` → 회원 탭          |
| 강의 관리        | `/admin` → 강의 탭          |
| 결제 관리·환불   | `/admin` → 결제 탭          |
| 리뷰 관리        | `/admin` → 리뷰 탭          |
| Q&A 관리         | `/admin` → Q&A 탭           |
| 강사 신청 승인   | `/admin` → 강사 신청 탭     |
| 전체 이메일 발송 | `/admin` → 이메일 탭        |
| 감사 로그 조회   | `GET /api/admin/audit-logs` |

### 강사 신청 흐름

1. 학생이 `/teacher-apply` 페이지에서 전화번호·자기소개를 제출
2. 제출 즉시 role이 `PENDING_TEACHER`로 변경 (로그인·수강은 가능, 강의 등록 불가)
3. 관리자가 `/admin` → 강사 신청 탭에서 내용 확인 후 승인/거절
4. 승인 시: role이 `TEACHER`로 변경 + 이메일 알림 발송
5. 거절 시: role이 `STUDENT`로 복귀

---

## 4. Discord 알림 설정 및 확인

### 4-1. 설정 방법

Discord 알림은 **Webhook URL** 이 환경변수에 등록되어 있어야 동작합니다.

#### Webhook URL 생성 방법

1. Discord 서버 → 채널 설정(⚙️) → **연동** → **웹훅** → **새 웹훅**
2. 이름 입력 → **웹훅 URL 복사**
3. 해당 URL을 GitHub Secrets의 `DISCORD_WEBHOOK_URL` 에 등록
4. 다음 배포(main 브랜치 push) 시 자동 적용

> Webhook URL이 비어 있으면 Discord 알림은 **무음 처리**되며 오류는 발생하지 않습니다.

---

### 4-2. 알림이 발생하는 시점 (별도 설정 불필요)

아래 이벤트는 서비스 사용 중 **자동으로** Discord 채널에 알림이 전송됩니다.

| 알림 종류    | 발생 시점                          | 메시지 예시                                                      |
| ------------ | ---------------------------------- | ---------------------------------------------------------------- |
| 💳 결제 완료 | 학생이 토스페이먼츠로 결제 성공 시 | `💳 결제 완료 - 학생: 홍길동 - 강좌: Java 기초 - 금액: 50,000원` |
| 📚 강좌 등록 | 강사가 새 강좌를 등록할 때         | `📚 새 강좌 등록 - 선생님: 김선생 - 강좌명: Spring Boot 완성`    |
| 🎓 수강 등록 | 학생이 강의를 수강 등록할 때       | `🎓 수강 등록 - 학생: 이학생 - 강좌: React 심화`                 |
| ↩️ 환불 처리 | 결제 취소·환불 발생 시             | `↩️ 환불 처리 - 학생: 박학생 - 환불금액: 30,000원`               |
| 📊 주간 통계 | **매주 월요일 오전 9시** 자동 발송 | 강사별 주간 신규 수강생 현황                                     |

#### 확인 방법

- 사이트에서 결제·수강신청·환불을 진행하면 수 초 이내 Discord 채널에 메시지가 도착합니다.
- 주간 통계는 월요일 9시에 자동 전송되며, 수동 확인은 [배치 작업 확인](#6-배치-작업-확인) 섹션 참고

---

## 5. 이메일(SMTP) 설정 및 확인

### 5-1. 설정 방법

Gmail 앱 비밀번호를 사용합니다.

1. Google 계정 → **보안** → **2단계 인증** 활성화
2. **앱 비밀번호** → "메일" / "기타(DevClass 입력)" → 16자리 코드 생성
3. GitHub Secrets에 등록:
   - `MAIL_USERNAME` : Gmail 주소 (예: `devclass122@gmail.com`)
   - `MAIL_PASSWORD` : 16자리 앱 비밀번호

> **주의:** Google 계정 비밀번호를 변경하면 앱 비밀번호도 **자동 만료**됩니다.  
> 이 경우 새 앱 비밀번호를 발급 받아야 하며, 아래 두 가지 방법 중 하나로 적용합니다.

**방법 A — EC2 직접 수정 (즉시 적용):**

```bash
ssh ec2-user@43.203.204.167
# .env 파일에서 MAIL_PASSWORD 값 교체
nano ~/devclass/.env
# 저장 후 백엔드 재시작
docker compose -f ~/devclass/docker-compose.yml up -d --force-recreate backend
```

**방법 B — GitHub Secrets 업데이트 (다음 배포 시 자동 적용):**

GitHub → Settings → Secrets → `MAIL_PASSWORD` 값 업데이트 → main 브랜치 push

---

### 5-2. 이메일이 발송되는 시점

| 이메일 종류      | 발생 시점               | 별도 설정 필요              |
| ---------------- | ----------------------- | --------------------------- |
| 이메일 인증 코드 | 회원가입 시 코드 요청   | 없음 (자동)                 |
| 결제 완료 영수증 | 결제 성공 후            | 없음 (자동)                 |
| 강좌 등록 알림   | 강사가 강좌 등록 시     | 없음 (자동)                 |
| 진행률 리마인더  | **매일 자정** 배치 실행 | 없음 (자동)                 |
| 전체 이메일 발송 | 관리자가 수동 발송      | 관리자 페이지에서 직접 작성 |

#### 진행률 리마인더 발송 조건

- 수강 등록 후 **7일이 경과**했고
- 진행률이 **30% 미만**인 학생에게 자동 발송

---

## 6. 배치 작업 확인

배치 작업(스케줄러)은 2종류이며 실행 기록이 DB에 저장됩니다.

### 6-1. 배치 작업 목록

| 작업명              | 실행 주기         | 내용                         |
| ------------------- | ----------------- | ---------------------------- |
| `PROGRESS_REMINDER` | 매일 자정 00:00   | 진행률 저조 학생 이메일 발송 |
| `WEEKLY_STATS`      | 매주 월요일 09:00 | Discord 주간 수강 통계 알림  |

### 6-2. 배치 실행 횟수·결과 확인 방법

#### 방법 A — DB 직접 조회 (권장)

```bash
# EC2 접속 후
cd ~/devclass
docker compose exec db mysql -u${DB_USERNAME} -p${DB_PASSWORD} devclass
```

```sql
-- 전체 실행 이력 (최신순)
SELECT id, job_name, status, started_at, completed_at, processed_count, error_message
FROM job_logs
ORDER BY started_at DESC;

-- 특정 작업만 조회
SELECT * FROM job_logs WHERE job_name = 'PROGRESS_REMINDER' ORDER BY started_at DESC LIMIT 10;
SELECT * FROM job_logs WHERE job_name = 'WEEKLY_STATS' ORDER BY started_at DESC LIMIT 10;

-- 성공/실패 집계
SELECT job_name, status, COUNT(*) as count
FROM job_logs
GROUP BY job_name, status;
```

#### 방법 B — 서버 로그에서 확인

```bash
docker compose logs backend --tail=200 | grep "\[Scheduler\]\|\[JobLog\]"
```

출력 예시:

```
[JobLog] 작업 시작 jobName=PROGRESS_REMINDER id=42
[Scheduler] 리마인더 발송 → 홍길동 (15%, Java 기초)
[JobLog] 작업 완료 id=42 processedCount=3
```

### 6-3. 배치 관련 코드 위치

```
backend/DevClass/src/main/java/rlaxogh76/DevClass/global/scheduler/
├── SchedulerService.java   # 스케줄러 실제 로직
├── JobLog.java             # 실행 기록 엔티티
├── JobLogService.java      # 실행 기록 저장/조회 서비스
└── JobLogRepository.java   # DB 접근
```

---

## 7. 보안 기능 확인

### 7-1. 로그인 실패 횟수 제한

- 동일 이메일로 **5회 연속 실패** 시 **15분 차단**
- 서버 재시작 시 초기화 (인메모리 방식)

**확인 방법:** 잘못된 비밀번호로 5회 로그인 시도 → 6번째 시도에서 `429 Too Many Requests` 응답

**관련 코드:** `global/security/LoginAttemptService.java`

---

### 7-2. 관리자 IP 화이트리스트

- 환경변수 `ADMIN_ALLOWED_IPS` 에 허용 IP를 등록 (쉼표 구분, CIDR 지원)
- **비어 있으면 제한 없음** (로컬·개발 환경 기본값)

**설정 예시:**

```
ADMIN_ALLOWED_IPS=203.0.113.1,10.0.0.0/8
```

**확인 방법:** 허용되지 않은 IP에서 `/api/admin/stats` 호출 시 `403 Forbidden` 응답

**관련 코드:** `global/config/SecurityConfig.java`

> **배포 환경 주의사항:** `docker-compose.yml`의 `backend` 서비스 `environment:` 섹션에  
> `ADMIN_ALLOWED_IPS: ${ADMIN_ALLOWED_IPS}` 가 명시되어 있어야 `.env` 값이 컨테이너로 전달됩니다.  
> 해당 항목 없이 `.env`만 수정하면 적용되지 않습니다.

---

### 7-3. 관리자 JWT 만료 단축

| 계정 종류     | JWT 만료 시간 |
| ------------- | ------------- |
| 일반 유저     | 24시간        |
| 관리자(ADMIN) | **1시간**     |

환경변수 `JWT_ADMIN_EXPIRATION_MS` 로 조정 가능 (단위: ms)

---

### 7-4. 관리자 감사 로그

모든 `/api/admin/**` API 호출이 DB에 자동 기록됩니다.

#### 조회 방법 A — API

```bash
curl -H "Authorization: Bearer <관리자_JWT>" \
     https://wrote-bridal-astrology-asylum.trycloudflare.com/api/admin/audit-logs
```

#### 조회 방법 B — DB 직접

```sql
SELECT id, email, ip, method, uri, status, created_at
FROM admin_audit_logs
ORDER BY created_at DESC
LIMIT 50;
```

기록 항목: 관리자 이메일, 접속 IP, HTTP 메서드, URI, 응답 코드, 시간

**관련 코드:**

```
global/interceptor/AdminAuditInterceptor.java
domain/admin/entity/AdminAuditLog.java
```

---

## 8. 로그 확인 방법

### 8-1. 실시간 로그 스트리밍

```bash
# EC2 접속 후
cd ~/devclass

# 전체 백엔드 로그
docker compose logs -f backend

# 전체 프론트엔드 로그
docker compose logs -f frontend

# 최근 100줄만
docker compose logs --tail=100 backend
```

### 8-2. 주요 로그 패턴별 필터링

```bash
# 이메일 발송 관련
docker compose logs backend | grep "\[Email\]"

# Discord 알림 관련
docker compose logs backend | grep "\[Discord\]"

# 스케줄러 배치 관련
docker compose logs backend | grep "\[Scheduler\]\|\[JobLog\]"

# 결제 관련
docker compose logs backend | grep "\[Payment\]\|\[Toss\]"

# 에러만
docker compose logs backend | grep "ERROR"

# 특정 사용자의 요청
docker compose logs backend | grep "user@example.com"
```

### 8-3. 로그 수준

`application.yml` 기준:

- `rlaxogh76.DevClass` 패키지: **DEBUG** 이상 전부 출력
- `org.hibernate.SQL`: **DEBUG** (쿼리 출력)
- 운영 환경(`application-prod.yml`): `show-sql: false`

---

### 8-4. Sentry 오류 모니터링

Sentry DSN이 환경변수 `SENTRY_DSN` 에 등록되어 있으면 **Exception 발생 시 Sentry 대시보드로 자동 수집**됩니다.

- Sentry 프로젝트: `https://sentry.io` 에서 해당 프로젝트 접속
- 샘플링 비율: 20% (`traces-sample-rate: 0.2`)

---

## 9. 서버 상태 모니터링

### 9-1. 헬스체크

```bash
curl https://wrote-bridal-astrology-asylum.trycloudflare.com/actuator/health
```

정상 응답:

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

> Actuator 상세 엔드포인트(`/actuator/**`)는 **서버 내 로컬(127.0.0.1)에서만 접근 가능**합니다.

### 9-2. 컨테이너 상태 확인

```bash
cd ~/devclass
docker compose ps          # 컨테이너 상태
docker stats --no-stream   # CPU/메모리 사용량
```

---

## 10. 배포 및 CI/CD

### 10-1. 자동 배포 흐름

```
개발자 코드 push → GitHub Actions CI (빌드·테스트) → 통과 시 CD 자동 실행
→ Docker Hub에 이미지 push → EC2 SSH 접속 → docker compose pull & up
→ 헬스체크 통과 시 배포 완료
```

- **CI:** `main`, `develop` 브랜치 push 또는 PR 시 실행
- **CD:** `main` 브랜치 push 시만 실행 (운영 배포)

### 10-2. 배포 이력 확인

GitHub 저장소 → **Actions** 탭 → **CD — Deploy to EC2** 워크플로우

### 10-3. 수동 배포 (긴급 시)

```bash
ssh ec2-user@43.203.204.167
cd ~/devclass
docker compose pull
docker compose up -d --remove-orphans
```

### 10-4. 롤백

```bash
# 이전 이미지 태그로 되돌리기
IMAGE_TAG=<이전_커밋_SHA> docker compose up -d
```

---

## 11. 환경변수 목록

GitHub Secrets에 등록된 값들이 배포 시 EC2의 `.env` 파일로 주입됩니다.

| 환경변수                  | 설명                                             | 필수 |
| ------------------------- | ------------------------------------------------ | :--: |
| `DB_USERNAME`             | MySQL 사용자 이름                                |  ✅  |
| `DB_PASSWORD`             | MySQL 비밀번호                                   |  ✅  |
| `DB_ROOT_PASSWORD`        | MySQL root 비밀번호                              |  ✅  |
| `JWT_SECRET`              | JWT 서명 키 (256bit 이상)                        |  ✅  |
| `JWT_ADMIN_EXPIRATION_MS` | 관리자 토큰 만료(ms), 기본 3600000(1h)           |      |
| `TOSS_SECRET_KEY`         | 토스페이먼츠 시크릿 키                           |  ✅  |
| `MAIL_USERNAME`           | Gmail 발신 주소                                  |  ✅  |
| `MAIL_PASSWORD`           | Gmail 앱 비밀번호 (16자리)                       |  ✅  |
| `DISCORD_WEBHOOK_URL`     | Discord Webhook URL                              |      |
| `SENTRY_DSN`              | Sentry DSN                                       |      |
| `ADMIN_ALLOWED_IPS`       | 관리자 허용 IP (쉼표 구분), 비어있으면 전체 허용 |      |
| `DOCKER_USERNAME`         | Docker Hub 사용자명                              |  ✅  |
| `DOCKER_PASSWORD`         | Docker Hub 비밀번호                              |  ✅  |
| `EC2_HOST`                | EC2 퍼블릭 IP                                    |  ✅  |
| `EC2_USER`                | EC2 SSH 사용자 (예: ubuntu)                      |  ✅  |
| `EC2_PASSWORD`            | EC2 SSH 비밀번호                                 |  ✅  |

---

## 12. 장애 대응 가이드

### 이메일 발송 실패 (SMTP Authentication failed)

Gmail 앱 비밀번호는 Google 계정 비밀번호 변경 시 자동 만료됩니다.

1. Google 계정 → 보안 → 앱 비밀번호에서 새 16자리 비밀번호 발급
2. EC2에서 즉시 적용: `nano ~/devclass/.env` → `MAIL_PASSWORD` 교체 → `docker compose up -d --force-recreate backend`
3. GitHub Secrets `MAIL_PASSWORD` 도 동일하게 업데이트 (다음 배포 시 유지)

### Discord 알림 미수신

1. `DISCORD_WEBHOOK_URL` 값 확인
2. Discord 채널에서 Webhook이 삭제되지 않았는지 확인
3. `docker compose logs backend | grep "\[Discord\]"` 로 오류 확인

### 관리자 페이지 접근 불가 (403)

**원인 1 — JWT 토큰 role 불일치:**  
DB에서 role을 ADMIN으로 변경했더라도 기존 JWT에는 이전 role이 담겨 있음.  
→ **로그아웃 후 재로그인**

**원인 2 — IP 화이트리스트 차단:**  
`ADMIN_ALLOWED_IPS` 값이 현재 IP와 불일치.  
→ EC2 `.env`에서 `ADMIN_ALLOWED_IPS=` (빈 값으로 제한 해제) 후 재시작

**원인 3 — docker-compose.yml 환경변수 누락:**  
`.env`에 값이 있어도 `docker-compose.yml`의 backend `environment:` 섹션에  
`ADMIN_ALLOWED_IPS: ${ADMIN_ALLOWED_IPS}` 가 없으면 컨테이너에 전달되지 않음.  
→ 해당 항목 추가 후 `docker compose up -d --force-recreate backend`

확인 명령:

```bash
docker exec devclass-backend env | grep ADMIN
```

### 서버 헬스체크 실패

```bash
docker compose logs --tail=100 backend  # 오류 원인 확인
docker compose restart backend          # 재시작
```

### DB 연결 오류

```bash
docker compose ps db        # DB 컨테이너 상태 확인
docker compose restart db   # DB 재시작
docker compose restart backend  # 백엔드 재시작
```

---

## 기술 스택

| 구분           | 기술                                         |
| -------------- | -------------------------------------------- |
| **백엔드**     | Java 21, Spring Boot 3, Spring Security, JPA |
| **프론트엔드** | React 18, TypeScript, Tailwind CSS, Vite     |
| **DB**         | MySQL 8.0                                    |
| **결제**       | 토스페이먼츠                                 |
| **인프라**     | AWS EC2, Docker, Nginx                       |
| **CI/CD**      | GitHub Actions                               |
| **모니터링**   | Spring Actuator, Sentry                      |
| **알림**       | Discord Webhook, Gmail SMTP                  |
