export const CATEGORIES = [
  "프론트엔드",
  "백엔드",
  "데이터사이언스",
  "DevOps / 인프라",
  "알고리즘 / CS 기초",
  "모바일",
];

export const CATEGORY_LABEL: Record<string, string> = {
  프론트엔드: "프론트엔드",
  백엔드: "백엔드",
  데이터사이언스: "데이터사이언스",
  "DevOps / 인프라": "DevOps / 인프라",
  "알고리즘 / CS 기초": "알고리즘 / CS 기초",
  모바일: "모바일",
};

export const LEVELS = ["초급", "중급", "고급"];

export const LEVEL_LABEL: Record<string, string> = {
  초급: "초급",
  중급: "중급",
  고급: "고급",
};

export const SORT_OPTIONS = [
  { value: "", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "rating", label: "평점순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
];

export const PAGE_SIZE = 8;
