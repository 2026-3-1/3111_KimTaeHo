interface Props {
  defaultValue: string;
  onSearch: (keyword: string) => void;
}

export default function CourseSearchBar({ defaultValue, onSearch }: Props) {
  return (
    <div className="relative flex-1">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
        🔍
      </span>
      <input
        type="text"
        defaultValue={defaultValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch((e.target as HTMLInputElement).value);
        }}
        placeholder="강의 제목으로 검색..."
        className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
      />
    </div>
  );
}
