# ADR-003: 에러 추적 도구로 Sentry (sentry-logback) 채택

- **날짜**: 2026-05-01
- **상태**: 승인됨 (Accepted)
- **결정자**: 김태호

---

## 맥락 (Context)

운영 환경에서 발생하는 에러를 실시간으로 감지하고 분석하기 위한 관측성 도구가 필요하다. 현재 Logback 로그만으로는 에러 발생 시 즉각적인 알림과 스택트레이스 집계가 어렵다.

**고려한 대안:**
1. **Sentry (sentry-spring-boot-starter)**: Spring Boot 완전 통합, 자동 계측
2. **Sentry (sentry-logback)**: Logback 연동만, 경량 통합
3. **OpenTelemetry + Jaeger**: 분산 트레이싱, 인프라 구축 필요
4. **ELK Stack (Elasticsearch + Logstash + Kibana)**: 강력하나 운영 비용 높음

---

## 결정 (Decision)

**Sentry (sentry-logback)** 방식을 채택한다.

`logback-spring.xml`에 `SentryAppender`를 추가하여 ERROR 레벨 로그를 자동으로 Sentry로 전송한다.

---

## 근거 (Rationale)

**sentry-logback 선택 이유:**
- Spring Boot 버전 호환성 문제 없음 (sentry-spring-boot-starter는 버전 의존성 있음)
- 기존 Logback 설정에 Appender 추가만으로 도입 완료
- 코드 변경 없이 모든 `log.error()` 자동 수집
- 무료 티어(5k events/month)로 학습 프로젝트에 충분

**OpenTelemetry를 선택하지 않은 이유:**
- Jaeger/Tempo 등 추가 인프라 구축 필요
- 현 단계에서 분산 트레이싱이 필요한 마이크로서비스 구조가 아님
- 향후 서비스 분리 시 도입 검토

---

## 설정

```xml
<!-- logback-spring.xml -->
<appender name="SENTRY" class="io.sentry.logback.SentryAppender">
    <options>
        <dsn>${SENTRY_DSN}</dsn>
    </options>
    <minimumEventLevel>ERROR</minimumEventLevel>   <!-- ERROR → Sentry 이벤트 -->
    <minimumBreadcrumbLevel>WARN</minimumBreadcrumbLevel>  <!-- WARN → 컨텍스트 breadcrumb -->
</appender>
```

```yaml
# application.yml
sentry:
  dsn: ${SENTRY_DSN:}   # 미설정 시 Sentry 비활성화 (로컬 개발)
```

---

## 결과 (Consequences)

- **긍정**: 운영 에러 실시간 알림, 스택트레이스 자동 집계, 알림 설정 가능
- **부정**: Sentry 서비스 의존성 추가 (DSN 미설정 시 비활성화로 개발환경 무영향)
- **중립**: 민감 정보(스택트레이스)가 Sentry 서버로 전송됨 → 개인정보 마스킹 필요 시 `beforeSend` 훅 추가

---

## 구현 참고

- `backend/src/main/resources/logback-spring.xml`: SentryAppender 설정
- `backend/src/main/resources/application.yml`: `sentry.dsn` 환경변수
- `.env.example`: `SENTRY_DSN=` 항목 추가 필요
- GitHub Secrets: `SENTRY_DSN` 추가 후 CD 파이프라인에서 주입
