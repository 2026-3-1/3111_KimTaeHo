import { useState } from "react";
import { postReview } from "../api/course";
import { useAuth } from "../context/AuthContext";

type Props = {
  courseId: number;
  onSuccess: () => void;
};

const RATING_LABELS = ["", "최악이에요", "별로에요", "보통이에요", "좋아요", "최고예요"];

export default function ReviewForm({ courseId, onSuccess }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }
    if (!comment.trim()) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      await postReview({ courseId, userId: user.id, rating, comment });
      onSuccess();
    } catch (e: any) {
      setError(
        e.response?.status === 409
          ? "이미 리뷰를 작성하셨습니다."
          : "리뷰 작성에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 pt-6 border-t border-zinc-800"
    >
      <h3 className="text-sm font-black text-white mb-4">리뷰 작성</h3>

      {/* 별점 */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl transition-transform hover:scale-110 leading-none"
          >
            <span
              className={
                star <= (hoverRating || rating)
                  ? "text-orange-400"
                  : "text-zinc-700"
              }
            >
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-zinc-500 ml-2">
            {RATING_LABELS[rating]}
          </span>
        )}
      </div>

      {/* 텍스트 */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="강의에 대한 솔직한 리뷰를 남겨주세요..."
        rows={4}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
      />

      {error && (
        <p className="text-red-400 text-xs font-medium mt-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "등록 중..." : "리뷰 등록"}
      </button>
    </form>
  );
}
