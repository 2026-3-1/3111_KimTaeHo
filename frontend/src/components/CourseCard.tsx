import { useNavigate } from "react-router-dom";
import type { Course } from "../types";

interface Props {
  course: Course;
}

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "from-indigo-500 to-purple-500",
  backend: "from-blue-500 to-cyan-500",
  database: "from-emerald-500 to-teal-500",
  devops: "from-orange-500 to-rose-500",
  algorithm: "from-violet-500 to-indigo-500",
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

const LEVEL_COLOR: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-orange-100 text-orange-700",
  ADVANCED: "bg-red-100 text-red-700",
};

function getColor(category: string) {
  return CATEGORY_COLORS[category] ?? "from-gray-400 to-gray-500";
}

export default function CourseCard({ course }: Props) {
  const navigate = useNavigate();
  const gradient = getColor(course.category);
  const levelClass = LEVEL_COLOR[course.level] ?? "bg-gray-100 text-gray-600";
  const levelLabel = LEVEL_LABEL[course.level] ?? course.level;

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100 hover:-translate-y-1 flex flex-col"
    >
      {/* 상단 컬러 배너 */}
      <div
        className={`bg-gradient-to-br ${gradient} h-28 flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-4xl font-black text-white opacity-80">
          {course.title.charAt(0)}
        </span>
      </div>

      {/* 본문 */}
      <div className="p-4 flex flex-col flex-1">
        {/* 카테고리 + 난이도 배지 */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs text-gray-400">{course.category}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelClass}`}
          >
            {levelLabel}
          </span>
        </div>

        {/* 제목 */}
        <h2 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 leading-snug flex-1">
          {course.title}
        </h2>

        {/* 강사 */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
            {course.teacherName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400 truncate">
            {course.teacherName}
          </span>
        </div>

        {/* 평점 + 가격 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs font-semibold text-gray-700">
              {Number(course.averageRating).toFixed(1)}
            </span>
          </div>
          <span className="text-sm font-bold text-indigo-600">
            {course.price === 0 ? "무료" : `${course.price.toLocaleString()}원`}
          </span>
        </div>
      </div>
    </div>
  );
}
