import { CATEGORY_LABEL, LEVEL_LABEL, SORT_OPTIONS } from "../types/course";

interface Props {
  category: string;
  level: string;
  sort: string;
  onRemoveCategory: () => void;
  onRemoveLevel: () => void;
  onRemoveSort: () => void;
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-lg font-semibold border border-zinc-700">
      {label}
      <button onClick={onRemove} className="hover:text-white">
        ✕
      </button>
    </span>
  );
}

export default function CourseActiveFilters({
  category,
  level,
  sort,
  onRemoveCategory,
  onRemoveLevel,
  onRemoveSort,
}: Props) {
  if (!category && !level && !sort) return null;

  return (
    <div className="flex gap-2 mb-5 flex-wrap">
      {category && (
        <FilterTag
          label={CATEGORY_LABEL[category]}
          onRemove={onRemoveCategory}
        />
      )}
      {level && (
        <FilterTag label={LEVEL_LABEL[level]} onRemove={onRemoveLevel} />
      )}
      {sort && (
        <FilterTag
          label={SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort}
          onRemove={onRemoveSort}
        />
      )}
    </div>
  );
}
