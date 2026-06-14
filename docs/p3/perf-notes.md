# 성능 최적화 기록 (Perf Notes)

## 1. DB 쿼리 최적화

### 1-1. 인덱스 추가

**파일**: `Dump20260511/add_performance_indexes.sql`

| 인덱스명 | 테이블 | 컬럼 | 개선 대상 쿼리 |
|---------|--------|------|---------------|
| `idx_enrollments_enrolled_at` | enrollments | enrolled_at | `findEnrollmentsSince()` (주간 통계 스케줄러) |
| `idx_enrollments_progress_enrolled` | enrollments | total_progress, enrolled_at | `findLowProgressEnrollments()` (리마인더 스케줄러) |
| `idx_courses_enrollment_count` | courses | enrollment_count | 인기 순 강좌 목록 정렬 |
| `idx_payments_status` | payments | status | 결제 상태별 조회 |
| `idx_payments_user_status` | payments | user_id, status | 사용자별 결제 내역 조회 |

**인덱스 효과 (예측)**:
- 스케줄러 쿼리: enrollments 전체 스캔 → 날짜 인덱스 활용으로 I/O 감소
- 강좌 목록: enrollment_count 정렬 시 filesort 제거

---

### 1-2. N+1 문제 해결 (JPQL FETCH JOIN)

**변경 전**: 수강 목록 조회 시 각 enrollment에서 user, course를 별도 쿼리로 로드  
→ N(수강) + N(유저) + N(강좌) = 3N+1 쿼리

**변경 후**: FETCH JOIN으로 단일 쿼리로 로드

```java
@Query("""
    SELECT e FROM Enrollment e
    JOIN FETCH e.user u
    JOIN FETCH e.course c
    WHERE e.user.id = :userId
    """)
List<Enrollment> findAllByUserIdWithDetails(@Param("userId") Long userId);
```

**적용 쿼리**: `findAllByUserIdWithDetails`, `findLowProgressEnrollments`, `findEnrollmentsSince`

---

## 2. 프론트엔드 최적화

### 2-1. React Code Splitting (Lazy Load)

**파일**: `frontend/src/App.tsx`

**변경 전**: 모든 페이지 컴포넌트를 단일 번들로 로드  
→ 초기 번들 크기 증가, FCP(First Contentful Paint) 지연

**변경 후**: `React.lazy()` + `Suspense`로 13개 페이지 코드 분할

```tsx
const CourseListPage = lazy(() => import('./pages/CourseListPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
// ... 13개 페이지 동일 적용
```

**효과**: 초기 로드 시 메인 청크만 다운로드, 페이지 이동 시 해당 청크만 추가 로드

---

### 2-2. Nginx 정적 자원 캐싱

**파일**: `frontend/nginx.conf`

```nginx
# JS/CSS 등 정적 자원: 1년 캐시 (해시 파일명으로 변경 감지)
location ~* \.(js|css|png|jpg|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# gzip 압축
gzip on;
gzip_types text/css application/javascript application/json;
```

**효과**: 재방문 사용자 정적 자원 재다운로드 제거, 전송량 최대 70% 절감

---

## 3. 성능 측정 방법

### 백엔드 슬로우 쿼리 분석

```sql
-- MySQL 슬로우 쿼리 로그 활성화 (개발환경)
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 1;   -- 1초 이상

-- 슬로우 쿼리 확인
SHOW VARIABLES LIKE 'slow_query_log_file';
```

### Actuator 메트릭으로 API 응답시간 측정

```bash
# HTTP 요청별 최대/평균/분위 응답시간
curl http://localhost:8080/actuator/metrics/http.server.requests | jq .

# JVM GC 메트릭
curl http://localhost:8080/actuator/metrics/jvm.gc.pause | jq .

# DB Connection Pool 상태
curl http://localhost:8080/actuator/metrics/hikaricp.connections | jq .
```

### 프론트엔드 성능 측정 (Lighthouse)

Chrome DevTools → Lighthouse → Performance 탭 실행

| 지표 | 목표값 |
|------|--------|
| FCP (First Contentful Paint) | < 1.8s |
| LCP (Largest Contentful Paint) | < 2.5s |
| TBT (Total Blocking Time) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

---

## 4. 향후 최적화 계획

| 항목 | 예상 효과 | 우선순위 |
|------|----------|---------|
| Redis 캐시 (강좌 목록) | 동일 쿼리 반복 제거 | 높음 |
| DB Connection Pool 튜닝 | HikariCP 파라미터 최적화 | 중간 |
| Circuit Breaker (Resilience4j) | 외부 API 장애 시 응답 안정화 | 높음 |
| 이미지 WebP 변환 | 전송량 30~50% 절감 | 낮음 |
