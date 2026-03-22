import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const CATEGORIES = ["frontend", "backend", "database", "devops", "algorithm"];
const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const SORT_OPTIONS = [
  { value: "newest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "rating", label: "평점순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
];

export default function CourseFilterPanel() {
  const [params, setParams] = useSearchParams();

  // URL 파라미터에서 현재 필터 값 읽기
  const keyword = params.get("keyword") ?? "";
  const category = params.get("category") ?? "";
  const level = params.get("level") ?? "";
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";
  const minRating = params.get("minRating") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Number(params.get("page") ?? "0");

  // 파라미터 업데이트 헬퍼 — 필터 변경 시 page를 0으로 리셋
  const setFilter = (key: string, value: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.set("page", "0");
      return next;
    });
  };

  // URL이 바뀔 때마다 API 호출
  useEffect(() => {
    const fetchCourses = async () => {
      const response = await axios.get("/api/courses", {
        params: Object.fromEntries(params.entries()),
      });
      console.log(response.data); // 상위 컴포넌트로 상태 lifting 권장
    };
    fetchCourses();
  }, [params]);

  return (
    <div className="flex flex-col gap-6 p-4 w-64 border-r">
      {/* 검색 */}
      <div>
        <label className="text-sm font-medium mb-1 block">검색</label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setFilter("keyword", e.target.value)}
          placeholder="강의명, 설명 검색"
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label className="text-sm font-medium mb-1 block">카테고리</label>
        <select
          value={category}
          onChange={(e) => setFilter("category", e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">전체</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 난이도 */}
      <div>
        <label className="text-sm font-medium mb-1 block">난이도</label>
        <div className="flex flex-col gap-1">
          {LEVELS.map((l) => (
            <label
              key={l}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="radio"
                name="level"
                value={l}
                checked={level === l}
                onChange={() => setFilter("level", l)}
              />
              {l === "BEGINNER"
                ? "초급"
                : l === "INTERMEDIATE"
                  ? "중급"
                  : "고급"}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="level"
              value=""
              checked={level === ""}
              onChange={() => setFilter("level", "")}
            />
            전체
          </label>
        </div>
      </div>

      {/* 가격 범위 */}
      <div>
        <label className="text-sm font-medium mb-1 block">가격</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setFilter("minPrice", e.target.value)}
            placeholder="최소"
            min={0}
            className="w-full border rounded px-2 py-2 text-sm"
          />
          <span className="self-center text-gray-400">~</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setFilter("maxPrice", e.target.value)}
            placeholder="최대"
            min={0}
            className="w-full border rounded px-2 py-2 text-sm"
          />
        </div>
      </div>

      {/* 최소 평점 */}
      <div>
        <label className="text-sm font-medium mb-1 block">
          최소 평점: {minRating || "전체"}
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={minRating || 0}
          onChange={(e) =>
            setFilter("minRating", e.target.value === "0" ? "" : e.target.value)
          }
          className="w-full"
        />
      </div>

      {/* 정렬 */}
      <div>
        <label className="text-sm font-medium mb-1 block">정렬</label>
        <select
          value={sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* 필터 초기화 */}
      <button
        onClick={() => setParams({ sort: "newest" })}
        className="w-full py-2 text-sm border rounded hover:bg-gray-50"
      >
        필터 초기화
      </button>
    </div>
  );
}
