import { useRef, useEffect } from "react";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  LEVELS,
  LEVEL_LABEL,
  SORT_OPTIONS,
} from "../types/course";

interface Props {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onReset: () => void;
  category: string;
  level: string;
  sort: string;
  onCategoryChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function CourseFilterPanel({
  open,
  onToggle,
  onClose,
  onReset,
  category,
  level,
  sort,
  onCategoryChange,
  onLevelChange,
  onSortChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = [category, level, sort].filter(Boolean).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="relative" ref={ref}>
      {/* 필터 버튼 */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
          open || activeCount > 0
            ? "bg-orange-500 border-orange-500 text-white"
            : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
        }`}
      >
        필터
        {activeCount > 0 && (
          <span className="bg-white text-orange-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
            {activeCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-14 w-72 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5 z-50">
          {/* 카테고리 */}
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
            카테고리
          </p>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => onCategoryChange(category === c ? "" : c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  category === c
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>

          {/* 난이도 */}
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
            난이도
          </p>
          <div className="flex gap-2 mb-5">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => onLevelChange(level === l ? "" : l)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  level === l
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {LEVEL_LABEL[l]}
              </button>
            ))}
          </div>

          {/* 정렬 */}
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
            정렬
          </p>
          <div className="flex flex-col gap-1 mb-5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  sort === opt.value
                    ? "bg-orange-500/10 text-orange-400 font-bold"
                    : "text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-2 pt-3 border-t border-zinc-800">
            <button
              onClick={onReset}
              className="flex-1 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-400 hover:bg-zinc-700 font-medium"
            >
              초기화
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-400"
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
