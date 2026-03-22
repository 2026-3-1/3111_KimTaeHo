import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, getLectures, getReviews } from "../api/course";
import type { CourseDetail, Lecture, Review } from "../types";
import ReviewItem from "../components/ReviewItem";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const id = Number(courseId);

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [courseData, lectureData, reviewData] = await Promise.all([
          getCourse(id),
          getLectures(id),
          getReviews(id),
        ]);
        setCourse(courseData);
        setLectures(lectureData);
        setReviews(reviewData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [courseId]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">불러오는 중...</div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-gray-400">
        강의를 찾을 수 없습니다.
      </div>
    );
  }

  // 초 → 분:초 변환
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
      >
        ← 강의 목록으로
      </button>

      {/* 강의 헤더 */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {course.title}
        </h1>
        <p className="text-gray-500 text-sm mb-4">{course.teacherName}</p>
        <p className="text-gray-600 mb-6">{course.description}</p>

        {/* 통계 */}
        <div className="flex gap-6 text-sm text-gray-500 mb-6">
          <span>📖 강의 {course.lectureCount}개</span>
          <span>
            ⭐ {course.averageRating.toFixed(1)} ({course.reviewCount}개 리뷰)
          </span>
        </div>

        {/* 가격 + 수강 신청 */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-indigo-600">
            {course.price.toLocaleString()}원
          </span>
          {/* TODO: 로그인 구현 후 실제 수강 신청 연동 */}
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            수강 신청
          </button>
        </div>
      </div>

      {/* 커리큘럼 */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">커리큘럼</h2>
        <div className="divide-y divide-gray-100">
          {lectures.map((lecture, index) => (
            <div
              key={lecture.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                <span className="text-sm text-gray-700">{lecture.title}</span>
              </div>
              <span className="text-xs text-gray-400">
                {formatDuration(lecture.duration)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          수강생 리뷰 ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">아직 리뷰가 없습니다.</p>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewItem key={review.reviewId} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
