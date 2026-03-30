interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CoursePagination({
  page,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-14">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-30 transition-colors"
      >
        ← 이전
      </button>

      {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
            p === page
              ? "bg-orange-500 text-white"
              : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-30 transition-colors"
      >
        다음 →
      </button>
    </div>
  );
}
