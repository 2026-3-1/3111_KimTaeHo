import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyEnrollments } from "../api/course";
import type { MyEnrollment } from "../types";
import { useAuth } from "../context/AuthContext";

function getProgressColor(p: number) {
  if (p === 100) return "#10b981";
  if (p > 0) return "#f97316";
  return "#3f3f46";
}

function getStatusMeta(p: number) {
  if (p === 100)
    return {
      label: "수강 완료",
      color: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
    };
  if (p > 0)
    return {
      label: "수강 중",
      color: "text-orange-400 bg-orange-400/10 border border-orange-400/20",
    };
  return {
    label: "미시작",
    color: "text-zinc-500 bg-zinc-800 border border-zinc-700",
  };
}

export default function MyEnrollmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getMyEnrollments(user.id);
        setEnrollments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-1 tracking-tight">
          내 강의
        </h1>
        <p className="text-zinc-500 text-sm">
          {!loading && `${enrollments.length}개의 강의를 수강 중입니다`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-800 rounded-2xl h-28 animate-pulse"
            />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-6xl mb-5">📚</p>
          <p className="text-lg font-black text-zinc-600 mb-2">
            아직 수강 중인 강의가 없어요
          </p>
          <p className="text-sm text-zinc-700 mb-8">
            원하는 강의를 찾아 수강을 시작해보세요
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-orange-400 transition-colors"
          >
            강의 탐색하기 →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => {
            const status = getStatusMeta(enrollment.totalProgress);
            const circumference = 2 * Math.PI * 22;
            return (
              <div
                key={enrollment.enrollmentId}
                className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-600 p-6 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-5">
                  {/* 원형 진행률 */}
                  <div className="shrink-0 relative w-14 h-14">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        fill="none"
                        stroke="#27272a"
                        strokeWidth="4"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        fill="none"
                        stroke={getProgressColor(enrollment.totalProgress)}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={
                          circumference * (1 - enrollment.totalProgress / 100)
                        }
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                      {enrollment.totalProgress}%
                    </span>
                  </div>

                  {/* 강의 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h2
                        onClick={() =>
                          navigate(`/courses/${enrollment.courseId}`)
                        }
                        className="text-sm font-bold text-white truncate cursor-pointer hover:text-orange-400 transition-colors"
                      >
                        {enrollment.courseTitle}
                      </h2>
                      <span
                        className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mb-3">
                      {enrollment.teacherName}
                    </p>

                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${enrollment.totalProgress}%`,
                          backgroundColor: getProgressColor(
                            enrollment.totalProgress,
                          ),
                        }}
                      />
                    </div>

                    {enrollment.lastWatchedLectureTitle && (
                      <p className="text-xs text-zinc-600 mt-2 truncate">
                        ▶ {enrollment.lastWatchedLectureTitle}
                      </p>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <button
                      onClick={() =>
                        navigate(`/courses/${enrollment.courseId}/watch`)
                      }
                      className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-xl transition-colors"
                    >
                      {enrollment.totalProgress > 0 ? "이어서 보기" : "시작하기"} →
                    </button>
                    <p className="text-xs text-zinc-700">
                      {enrollment.coursePrice.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
