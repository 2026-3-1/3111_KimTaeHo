import { useNavigate } from "react-router-dom";
import type { Course } from "../types";

interface Props {
  course: Course;
}

const CATEGORY_META: Record<
  string,
  { emoji: string; label: string; accent: string }
> = {
  프론트엔드: { emoji: "⚛️", label: "프론트엔드", accent: "text-blue-400" },
  백엔드: { emoji: "⚙️", label: "백엔드", accent: "text-green-400" },
  데이터사이언스: {
    emoji: "📊",
    label: "데이터사이언스",
    accent: "text-purple-400",
  },
  "DevOps / 인프라": {
    emoji: "🚀",
    label: "DevOps / 인프라",
    accent: "text-orange-400",
  },
  "알고리즘 / CS 기초": {
    emoji: "🧠",
    label: "알고리즘 / CS 기초",
    accent: "text-pink-400",
  },
  모바일: { emoji: "📱", label: "모바일", accent: "text-teal-400" },
};

const LEVEL_META: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: "초급", color: "text-emerald-400 bg-emerald-400/10" },
  INTERMEDIATE: { label: "중급", color: "text-amber-400 bg-amber-400/10" },
  ADVANCED: { label: "고급", color: "text-red-400 bg-red-400/10" },
};

export default function CourseCard({ course }: Props) {
  const navigate = useNavigate();
  const meta = CATEGORY_META[course.category] ?? {
    emoji: "📚",
    label: course.category,
    accent: "text-zinc-400",
  };
  const level = LEVEL_META[course.level] ?? {
    label: course.level,
    color: "text-zinc-400 bg-zinc-400/10",
  };

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
    >
      {/* 썸네일 */}
      <div className="relative h-40 bg-zinc-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900" />
        <span className="relative text-5xl">{meta.emoji}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
        <span
          className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-md bg-zinc-900/70 backdrop-blur-sm ${meta.accent}`}
        >
          {meta.label}
        </span>
      </div>

      {/* 본문 */}
      <div className="p-4 flex flex-col flex-1">
        <span
          className={`self-start text-xs font-semibold px-2 py-0.5 rounded-md mb-2 ${level.color}`}
        >
          {level.label}
        </span>

        <h2 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug flex-1 group-hover:text-orange-400 transition-colors">
          {course.title}
        </h2>

        <p className="text-xs text-zinc-500 mb-3 truncate">
          {course.teacherName}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-1">
            <span className="text-orange-400 text-xs">★</span>
            <span className="text-xs font-bold text-zinc-300">
              {Number(course.averageRating).toFixed(1)}
            </span>
          </div>
          <span className="text-sm font-black text-white">
            {course.price === 0 ? "무료" : `${course.price.toLocaleString()}원`}
          </span>
        </div>
      </div>
    </div>
  );
}
