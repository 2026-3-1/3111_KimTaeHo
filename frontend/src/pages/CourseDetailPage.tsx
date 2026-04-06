import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, getLectures, getReviews, enroll, getMyEnrollments } from "../api/course";
import type { CourseDetail, Lecture, Review, MyEnrollment } from "../types";
import ReviewItem from "../components/ReviewItem";
import ReviewForm from "../components/ReviewForm";
import { useAuth } from "../context/AuthContext";

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  frontend: { emoji: "⚛️", label: "Frontend" },
  backend: { emoji: "⚙️", label: "Backend" },
  database: { emoji: "🗄️", label: "Database" },
  devops: { emoji: "🚀", label: "DevOps" },
  algorithm: { emoji: "🧠", label: "Algorithm" },
};

const LEVEL_META: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: "초급", color: "text-emerald-400 bg-emerald-400/10" },
  INTERMEDIATE: { label: "중급", color: "text-amber-400 bg-amber-400/10" },
  ADVANCED: { label: "고급", color: "text-red-400 bg-red-400/10" },
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-32 bg-zinc-800 rounded-lg" />
      <div className="bg-zinc-900 rounded-2xl p-8 space-y-4 border border-zinc-800">
        <div className="h-8 w-3/4 bg-zinc-800 rounded-lg" />
        <div className="h-4 w-1/4 bg-zinc-800 rounded" />
        <div className="h-20 bg-zinc-800 rounded-lg" />
        <div className="h-14 bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myEnrollment, setMyEnrollment] = useState<MyEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const id = Number(courseId);
    const fetchAll = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [
          getCourse(id),
          getLectures(id),
          getReviews(id),
        ];
        if (isLoggedIn && user) {
          promises.push(getMyEnrollments(user.id));
        }
        const results = await Promise.all(promises);
        setCourse(results[0] as CourseDetail);
        setLectures(results[1] as Lecture[]);
        setReviews(results[2] as Review[]);
        if (isLoggedIn && user && results[3]) {
          const found = (results[3] as MyEnrollment[]).find((e) => e.courseId === id);
          if (found) {
            setMyEnrollment(found);
            setEnrolled(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [courseId, isLoggedIn, user]);

  const handleEnroll = async () => {
    if (!courseId) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/courses/${courseId}` } });
      return;
    }
    setEnrolling(true);
    setEnrollError("");
    try {
      await enroll(user!.id, Number(courseId));
      setEnrolled(true);
    } catch (e: any) {
      setEnrollError(
        e.response?.status === 409
          ? "이미 수강 중인 강의입니다."
          : "수강 신청에 실패했습니다.",
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (!course)
    return (
      <div className="text-center py-32">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-lg font-bold text-zinc-600">
          강의를 찾을 수 없습니다
        </p>
      </div>
    );

  const catMeta = CATEGORY_META[course.category] ?? {
    emoji: "📚",
    label: course.category,
  };
  const level = LEVEL_META[course.level] ?? {
    label: course.level,
    color: "text-zinc-400 bg-zinc-400/10",
  };

  const enrollmentId = myEnrollment?.enrollmentId ?? null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-6 font-medium transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">
          ←
        </span>
        강의 목록으로
      </button>

      {/* 강의 헤더 */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-5">
        {/* 썸네일 배너 */}
        <div className="h-48 bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent" />
          <span className="text-8xl">{catMeta.emoji}</span>
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/80 to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${level.color}`}
            >
              {level.label}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {catMeta.label}
            </span>
          </div>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-black text-white mb-2 leading-tight">
            {course.title}
          </h1>
          <p className="text-zinc-500 text-sm mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-black border border-zinc-700">
              {course.teacherName.charAt(0).toUpperCase()}
            </span>
            {course.teacherName}
          </p>
          <p className="text-zinc-400 leading-relaxed mb-7 text-sm">
            {course.description}
          </p>

          {/* 통계 */}
          <div className="flex gap-3 mb-7">
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-2.5 border border-zinc-700">
              <span className="text-base">📖</span>
              <div>
                <p className="text-xs text-zinc-500">강의 수</p>
                <p className="text-sm font-black text-white">
                  {course.lectureCount}개
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-2.5 border border-zinc-700">
              <span className="text-orange-400 text-base">★</span>
              <div>
                <p className="text-xs text-zinc-500">평균 평점</p>
                <p className="text-sm font-black text-white">
                  {Number(course.averageRating).toFixed(1)}
                  <span className="text-xs font-normal text-zinc-500 ml-1">
                    ({course.reviewCount}개)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 가격 + 수강 신청 */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">수강료</p>
              <p className="text-3xl font-black text-white">
                {course.price.toLocaleString()}
                <span className="text-lg font-bold text-zinc-400">원</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {enrolled ? (
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 text-sm font-bold">
                    ✓ 수강 중
                  </span>
                  {enrollmentId && (
                    <button
                      onClick={() =>
                        navigate(
                          `/courses/${courseId}/watch?lectureId=${lectures[0]?.id ?? ""}`,
                        )
                      }
                      className="text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 px-5 py-2.5 rounded-xl transition-colors"
                    >
                      강의 보기 →
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/my")}
                    className="text-sm font-bold text-orange-400 border border-orange-500/30 px-5 py-2.5 rounded-xl hover:bg-orange-500/10 transition-colors"
                  >
                    내 강의 →
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {enrolling
                    ? "신청 중..."
                    : isLoggedIn
                      ? "수강 신청하기"
                      : "로그인 후 수강 신청"}
                </button>
              )}
              {enrollError && (
                <p className="text-red-400 text-xs font-medium">
                  {enrollError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 커리큘럼 */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 mb-5">
        <h2 className="text-base font-black text-white mb-5 flex items-center gap-2">
          커리큘럼
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
            {lectures.length}강
          </span>
        </h2>
        {lectures.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">
            등록된 강의 영상이 없습니다.
          </p>
        ) : (
          <div className="space-y-1">
            {lectures.map((lecture, index) => (
              <div
                key={lecture.id}
                onClick={() =>
                  enrolled
                    ? navigate(`/courses/${courseId}/watch?lectureId=${lecture.id}`)
                    : undefined
                }
                className={`flex items-center justify-between py-3 px-3 rounded-xl transition-colors group ${
                  enrolled ? "cursor-pointer hover:bg-zinc-800" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-xs font-black flex items-center justify-center shrink-0 group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-colors border border-zinc-700">
                    {index + 1}
                  </span>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    {lecture.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {enrolled && (
                    <span className="text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ▶
                    </span>
                  )}
                  <span className="text-xs text-zinc-600 font-mono bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                    {formatDuration(lecture.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 리뷰 */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h2 className="text-base font-black text-white mb-5 flex items-center gap-2">
          수강생 리뷰
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
            {reviews.length}개
          </span>
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">
            아직 리뷰가 없습니다.
          </p>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewItem key={review.reviewId} review={review} />
            ))}
          </div>
        )}

        {/* 리뷰 작성 폼: 수강 중이고 아직 제출 안 한 경우 */}
        {enrolled && !reviewSubmitted && (
          <ReviewForm
            courseId={course.id}
            onSuccess={() => {
              setReviewSubmitted(true);
              getReviews(course.id)
                .then(setReviews)
                .catch(console.error);
            }}
          />
        )}
        {enrolled && reviewSubmitted && (
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-emerald-400 text-sm font-bold">
              ✓ 리뷰가 등록되었습니다. 감사합니다!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
