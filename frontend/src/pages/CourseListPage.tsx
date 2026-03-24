import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCourses } from "../api/course";
import type { Course } from "../types";
import CourseCard from "../components/CourseCard";

const CATEGORIES = [
  "프론트엔드",
  "백엔드",
  "데이터사이언스",
  "DevOps / 인프라",
  "알고리즘 / CS 기초",
  "모바일",
];
const LEVELS = ["입문", "초급", "중급", "고급"];
const SORT_OPTIONS = [
  { value: "", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "rating", label: "평점순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
];

const SIZE = 8;

export default function CourseListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // URL에서 현재 필터 값 읽기
  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "";
  const level = searchParams.get("level") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const page = Number(searchParams.get("page") ?? "0");

  const totalPages = Math.ceil(totalElements / SIZE);
  const activeFilterCount = [category, level, sort].filter(Boolean).length;

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", "0");
      return next;
    });
  };

  const goToPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
  };

  const handleReset = () => {
    setSearchParams({});
    setFilterOpen(false);
  };

  // searchParams 바뀔 때마다 API 호출
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          size: String(SIZE),
        };
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (level) params.level = level;
        if (sort) params.sort = sort;

        const data = await getCourses(params);
        setCourses(data.content);
        setTotalElements(data.totalElements);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [searchParams]);

  return (
    <div>
      {/* 검색 + 필터 버튼 */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">
            🔍
          </span>
          <input
            type="text"
            defaultValue={keyword}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setParam("keyword", (e.target as HTMLInputElement).value);
            }}
            placeholder="강의 제목으로 검색"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* 필터 버튼 */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-medium shadow-sm transition-colors ${
              filterOpen || activeFilterCount > 0
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>필터</span>
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50">
              {/* 카테고리 */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  카테고리
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setParam("category", category === c ? "" : c)
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        category === c
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 난이도 */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  난이도
                </p>
                <div className="flex gap-1.5">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setParam("level", level === l ? "" : l)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        level === l
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* 정렬 */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  정렬
                </p>
                <div className="flex flex-col gap-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setParam("sort", opt.value)}
                      className={`text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                        sort === opt.value
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
                >
                  초기화
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                >
                  적용
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 활성 필터 태그 */}
      {(category || level || sort) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {category && (
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-medium">
              {category}
              <button
                onClick={() => setParam("category", "")}
                className="ml-1 hover:text-indigo-900"
              >
                ✕
              </button>
            </span>
          )}
          {level && (
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-medium">
              {level}
              <button
                onClick={() => setParam("level", "")}
                className="ml-1 hover:text-indigo-900"
              >
                ✕
              </button>
            </span>
          )}
          {sort && (
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-medium">
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              <button
                onClick={() => setParam("sort", "")}
                className="ml-1 hover:text-indigo-900"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* 결과 수 */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-5">
          총{" "}
          <span className="text-indigo-600 font-semibold">{totalElements}</span>
          개의 강의
        </p>
      )}

      {/* 강의 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: SIZE }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-64 animate-pulse"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 text-gray-300">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-base">강의가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages - 1}
            className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
