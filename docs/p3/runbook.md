# 운영 런북 (Runbook)

> DevClass 서비스 운영자를 위한 장애 대응 및 운영 가이드

---

## 서비스 구성

| 서비스 | 포트 | 헬스체크 |
|--------|------|----------|
| Backend (Spring Boot) | 8080 | `GET /actuator/health` |
| Frontend (Nginx) | 80 | `curl http://localhost` |
| MySQL | 3306 | `mysqladmin ping` |

---

## 정기 점검 명령어

```bash
# 전체 컨테이너 상태 확인
docker compose ps

# 헬스체크
curl http://localhost:8080/actuator/health | jq .

# 메트릭 확인 (Prometheus 형식)
curl http://localhost:8080/actuator/metrics

# 백엔드 로그 실시간 확인
docker compose logs -f backend

# 최근 작업 로그 조회
docker compose exec db mysql -u$DB_USERNAME -p$DB_PASSWORD devclass \
  -e "SELECT job_name, status, started_at, processed_count FROM job_logs ORDER BY started_at DESC LIMIT 10;"
```

---

## 장애 시나리오별 대응

### 시나리오 1: 외부 API (Toss Payments) 다운

**증상**: 결제 요청 시 502 응답, Sentry에 `PAYMENT_CONFIRM_FAILED` 알림

**확인:**
```bash
# Toss API 직접 연결 확인
curl -I https://api.tosspayments.com/v1/payments/confirm

# 최근 결제 실패 로그
docker compose logs backend | grep "\\[Toss\\] 결제 승인 실패"

# 결제 상태 확인
docker compose exec db mysql -u$DB_USERNAME -p$DB_PASSWORD devclass \
  -e "SELECT id, order_id, status, created_at FROM payments WHERE status='PENDING' ORDER BY created_at DESC LIMIT 20;"
```

**대응:**
1. Toss 개발자 센터 서비스 상태 확인: https://www.tosspayments.com
2. 재시도 정책이 3회 자동 실행됨 (로그 확인)
3. 지속 장애 시 결제 수동 처리 안내 공지
4. PENDING 상태 결제는 Toss 대시보드에서 상태 확인 후 수동 확인

**복구 확인:**
```bash
curl http://localhost:8080/actuator/health | grep -i "UP"
```

---

### 시나리오 2: DB (MySQL) 다운

**증상**: 모든 API 500 응답, 헬스체크 DOWN

**확인:**
```bash
# DB 컨테이너 상태
docker compose ps db

# DB 로그
docker compose logs db --tail=50

# 헬스체크 상태
curl http://localhost:8080/actuator/health | jq .db
```

**대응:**
```bash
# DB 재시작
docker compose restart db

# DB 정상화 후 백엔드 재시작
docker compose restart backend

# 재시작 완료 확인 (최대 60초)
until curl -sf http://localhost:8080/actuator/health | grep -q '"status":"UP"'; do
  echo "대기 중..."; sleep 5
done
echo "✅ 서비스 정상화 완료"
```

---

### 시나리오 3: 스케줄러 실패

**증상**: `job_logs` 테이블에 FAILED 레코드, Discord 미발송

**확인:**
```bash
# 실패한 작업 조회
docker compose exec db mysql -u$DB_USERNAME -p$DB_PASSWORD devclass \
  -e "SELECT * FROM job_logs WHERE status='FAILED' ORDER BY started_at DESC LIMIT 5;"

# 스케줄러 로그 확인
docker compose logs backend | grep "\\[Scheduler\\]"
```

**대응:**
1. `error_message` 컬럼에서 오류 원인 확인
2. 이메일/Discord 서비스 가용성 점검
3. 필요 시 스케줄러 수동 트리거 (개발자 직접 실행)

---

### 시나리오 4: 이메일/Discord 알림 불전송

**증상**: 학생 이메일 미수신, Discord 채널 업데이트 없음

**확인:**
```bash
# 알림 발송 로그 확인
docker compose logs backend | grep -E "\\[Email\\]|\\[Discord\\]"

# 환경변수 확인
docker compose exec backend env | grep -E "MAIL_|DISCORD_"
```

**대응:**
1. 이메일: Gmail SMTP 인증 확인, 앱 비밀번호 유효성 검증
2. Discord: Webhook URL 유효성 확인 (`curl -X POST <DISCORD_WEBHOOK_URL> -H "Content-Type: application/json" -d '{"content":"테스트"}'`)
3. 재시도 정책(3회)이 소진된 경우 → 환경변수 갱신 후 `docker compose restart backend`

---

## 배포 롤백

```bash
# 이전 이미지 태그로 롤백
docker compose pull
# docker-compose.yml의 image 태그를 이전 커밋 SHA로 수정 후:
docker compose up -d --remove-orphans
```

---

## 모니터링 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /actuator/health` | 전체 헬스체크 (DB 포함) |
| `GET /actuator/metrics` | JVM, HTTP, DB 메트릭 목록 |
| `GET /actuator/prometheus` | Prometheus 형식 메트릭 |
| `GET /actuator/info` | 빌드/버전 정보 |

---

## 시크릿 교체 절차

1. GitHub Secrets에서 새 값 입력 (Settings → Secrets → Actions)
2. CD 파이프라인 재실행 (빈 커밋 푸시 또는 수동 트리거)
3. 배포 완료 후 헬스체크로 정상 동작 확인
