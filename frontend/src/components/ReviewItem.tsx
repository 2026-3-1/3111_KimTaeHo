import type { Review } from "../types";

interface Props {
  review: Review;
}

export default function ReviewItem({ review }: Props) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

  return (
    <div className="border-b border-gray-100 py-4 last:border-none">
      <div className="flex items-center gap-2 mb-1">
        {/* 별점 */}
        <div className="flex">
          {stars.map((filled, i) => (
            <span
              key={i}
              className={filled ? "text-yellow-400" : "text-gray-200"}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-sm text-gray-500">{review.userEmail}</span>
        <span className="text-xs text-gray-300 ml-auto">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-700">{review.comment}</p>
    </div>
  );
}
