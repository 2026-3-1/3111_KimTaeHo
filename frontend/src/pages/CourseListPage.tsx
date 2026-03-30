import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCourses } from "../api/course";
import type { Course } from "../types";
import CourseCard from "../components/CourseCard";
import CourseFilterPanel from "../components/CourseFilterPanel";
import CoursePagination from "../components/CoursePagination";
import CourseSearchBar from "../components/CourseSearchBar";
import { PAGE_SIZE } from "../types/course";
import CourseActiveFilters from "../components/CourseActiveFilters";

export default function CourseListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "";
  const level = searchParams.get("level") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const page = Number(searchParams.get("page") ?? "0");
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", "0");
      return next;
    });
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          size: String(PAGE_SIZE),
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
    fetch();
  }, [keyword, category, level, sort, page]);

  return (
    <div>
      {/* 히어로 */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
          개발 강의 탐색
        </h1>
        <p className="text-zinc-400 text-sm">
          {!loading && totalElements > 0
            ? `총 ${totalElements}개의 강의`
            : "원하는 강의를 찾아보세요"}
        </p>
      </div>

      {/* 검색 + 필터 */}
      <div className="flex gap-3 mb-6">
        <CourseSearchBar
          defaultValue={keyword}
          onSearch={(kw) => setParam("keyword", kw)}
        />
        <CourseFilterPanel
          open={filterOpen}
          onToggle={() => setFilterOpen((o) => !o)}
          onClose={() => setFilterOpen(false)}
          onReset={() => {
            setSearchParams({});
            setFilterOpen(false);
          }}
          category={category}
          level={level}
          sort={sort}
          onCategoryChange={(v) => setParam("category", v)}
          onLevelChange={(v) => setParam("level", v)}
          onSortChange={(v) => setParam("sort", v)}
        />
      </div>

      {/* 활성 필터 태그 */}
      <CourseActiveFilters
        category={category}
        level={level}
        sort={sort}
        onRemoveCategory={() => setParam("category", "")}
        onRemoveLevel={() => setParam("level", "")}
        onRemoveSort={() => setParam("sort", "")}
      />

      {/* 강의 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-800 rounded-2xl h-64 animate-pulse"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-6xl mb-5">🔭</p>
          <p className="text-lg font-bold text-zinc-600 mb-2">
            강의가 없습니다
          </p>
          <p className="text-sm text-zinc-700">
            다른 검색어나 필터를 시도해보세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <CoursePagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) =>
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(p));
            return next;
          })
        }
      />
    </div>
  );
}
