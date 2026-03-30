import type { Review } from "../types";

interface Props {
  review: Review;
}

export default function ReviewItem({ review }: Props) {
  return (
    <div className="py-5 border-b border-zinc-800 last:border-none">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-300">
            {review.userEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-300">
              {review.userEmail}
            </p>
            <div className="flex mt-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < review.rating ? "text-orange-400" : "text-zinc-700"}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-zinc-600">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed pl-10">
        {review.comment}
      </p>
    </div>
  );
}
