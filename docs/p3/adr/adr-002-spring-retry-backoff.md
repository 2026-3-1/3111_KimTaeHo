# ADR-002: 외부 API 재시도 정책으로 Spring Retry + 지수 백오프 채택

- **날짜**: 2026-04-20
- **상태**: 승인됨 (Accepted)
- **결정자**: 김태호

---

## 맥락 (Context)

Toss Payments, Discord Webhook, Gmail SMTP 등 외부 API 호출은 일시적인 네트워크 오류나 서버 과부하로 실패할 수 있다. 단순 재시도는 서버 과부하를 악화시킬 수 있어 적절한 대기 간격이 필요하다.

**고려한 대안:**
1. **수동 재시도 루프**: 직접 for-loop + Thread.sleep 구현
2. **Spring Retry (@Retryable)**: 선언적 AOP 기반, Spring 공식 지원
3. **Resilience4j**: Circuit Breaker + Retry + RateLimiter 포함, 더 강력하지만 복잡

---

## 결정 (Decision)

**Spring Retry**를 채택한다.
- Toss Payments: `@Retryable` 어노테이션 방식
- Discord/Email: `RetryTemplate` 직접 주입 방식 (비공개 메서드 제약)

**지수 백오프 설정**: 1초 → 2초 → 4초 (최대 3회, 최대 대기 8초)

---

## 근거 (Rationale)

**Spring Retry 선택 이유:**
- Spring Boot 생태계와의 자연스러운 통합 (`@EnableRetry`, `@Retryable`)
- 선언적 방식으로 비즈니스 코드와 재시도 정책 분리
- `ExponentialBackOffPolicy`로 서버 부하 감소 효과

**Resilience4j를 선택하지 않은 이유:**
- 현 단계에서는 Circuit Breaker까지 필요하지 않음
- 추가 설정 복잡도 증가 대비 효용 낮음 (향후 장애 패턴이 명확해지면 도입 검토)

**지수 백오프 설정 근거:**
- 1초 초기 대기: 일시적 네트워크 지연 대부분 해소
- 2배 증가: 서버 과부하 상황에서 요청 집중 완화
- 최대 3회: 사용자 응답 시간(최대 7초) 허용 범위 내

---

## 결과 (Consequences)

- **긍정**: 일시적 외부 API 오류 자동 복구, 사용자 경험 개선
- **부정**: 최악의 경우 결제 응답 지연 7초 발생
- **중립**: `BusinessException`은 재시도하지 않으므로 비즈니스 오류는 즉시 반환됨

---

## 구현 참고

- `global/payment/TossPaymentClient.java`: `@Retryable(maxAttempts=3, backoff=@Backoff(delay=1000, multiplier=2.0))`
- `global/config/RetryConfig.java`: `RetryTemplate` Bean 정의
- `global/notification/DiscordService.java`: `notificationRetryTemplate.execute(ctx -> {...})`
- `global/notification/EmailService.java`: `notificationRetryTemplate.execute(ctx -> {...})`
