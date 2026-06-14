# ADR-001: 결제 PG사로 Toss Payments 선택

- **날짜**: 2026-04-10
- **상태**: 승인됨 (Accepted)
- **결정자**: 김태호

---

## 맥락 (Context)

DevClass 플랫폼에 강좌 결제 기능을 추가해야 한다. 국내 서비스이므로 원화 결제와 간편 결제(카카오페이, 네이버페이 등)를 지원해야 하며, 개발 친화적인 API가 필요하다.

**고려한 대안:**
1. **KG이니시스**: 국내 점유율 높음, 레거시 API 구조
2. **Toss Payments**: 현대적 REST API, 샌드박스 환경 제공, 국내 간편결제 통합
3. **Stripe**: 글로벌 표준, 원화 결제 지원하나 국내 간편결제 미지원

---

## 결정 (Decision)

**Toss Payments**를 채택한다.

---

## 근거 (Rationale)

| 기준 | KG이니시스 | Toss Payments | Stripe |
|------|-----------|---------------|--------|
| API 현대성 | ❌ SOAP/구형 | ✅ REST/JSON | ✅ REST/JSON |
| 샌드박스 | 제한적 | ✅ 완전 지원 | ✅ 완전 지원 |
| 카카오/네이버페이 | ✅ | ✅ | ❌ |
| 개발 문서 품질 | 보통 | ✅ 우수 | ✅ 우수 |
| 수수료 | 유사 | 유사 | 더 비쌈 |

Toss Payments는 Base64 인증 방식의 단순한 REST API와 완전한 샌드박스 환경으로 빠른 개발이 가능하다.

---

## 결과 (Consequences)

- **긍정**: 개발 속도 향상, 풍부한 공식 문서, 국내 간편결제 통합
- **부정**: Toss Payments 서비스 장애 시 결제 불가 (재시도 정책으로 완화)
- **중립**: Toss 특화 API 구조로 타 PG사 전환 시 리팩토링 필요

---

## 구현 참고

- `global/payment/TossPaymentClient.java`: `@Retryable` 재시도 정책 적용
- `domain/payment/service/PaymentService.java`: 멱등성 처리 (PAID 상태 조기 반환)
