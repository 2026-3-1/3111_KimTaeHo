import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  getCourse,
  getLectures,
  getMyEnrollments,
  updateProgress,
} from "../api/course";
import type { CourseDetail, Lecture, MyEnrollment } from "../types";
import { useAuth } from "../context/AuthContext";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function WatchPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [enrollment, setEnrollment] = useState<MyEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const lectureIdParam = searchParams.get("lectureId");
  const currentLecture =
    lectures.find((l) => l.id === Number(lectureIdParam)) ??
    lectures[0] ??
    null;
  const currentIndex = lectures.findIndex((l) => l.id === currentLecture?.id);

  useEffect(() => {
    if (!courseId) return;
    const id = Number(courseId);

    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseData, lectureData] = await Promise.all([
          getCourse(id),
          getLectures(id),
        ]);
        setCourse(courseData);
        setLectures(lectureData);

        // 수강 중인 경우 진행률 저장용으로만 enrollment 조회
        if (user) {
          try {
            const enrollments = await getMyEnrollments(user.id);
            const found = enrollments.find((e) => e.courseId === id);
            if (found) setEnrollment(found);
          } catch {
            // 수강 정보 없어도 시청은 가능
          }
        }

        // 초기 강의 설정: URL에 lectureId 없으면 첫 번째로
        if (!lectureIdParam && lectureData.length > 0) {
          setSearchParams(
            { lectureId: String(lectureData[0].id) },
            { replace: true },
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user]);

  const handleSelectLecture = useCallback(
    async (lecture: Lecture) => {
      setSearchParams({ lectureId: String(lecture.id) });
      if (!enrollment) return;
      const idx = lectures.findIndex((l) => l.id === lecture.id);

      const newProgress = ((idx + 1) / lectures.length) * 100;

      const progress = Math.floor(
        Math.max(enrollment.totalProgress, newProgress),
      );
      try {
        await updateProgress(enrollment.enrollmentId, {
          userId: user!.id,
          lastWatchedLectureId: lecture.id,
          currentProgress: progress,
        });
        setEnrollment((prev) =>
          prev ? { ...prev, totalProgress: progress } : prev,
        );
      } catch (e) {
        console.error(e);
      }
    },
    [enrollment, lectures, setSearchParams],
  );

  const handlePrev = () => {
    if (currentIndex > 0) handleSelectLecture(lectures[currentIndex - 1]);
  };

  const handleNext = () => {
    if (currentIndex < lectures.length - 1)
      handleSelectLecture(lectures[currentIndex + 1]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-600 text-sm">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 -mt-4">
      {/* 사이드바 */}
      <aside className="w-68 shrink-0">
        <div className="sticky top-20">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1 mb-3"
          >
            ← 강의 상세로
          </button>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <p className="text-xs font-black text-white truncate">
                {course?.title}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {currentIndex + 1} / {lectures.length}강 ·{" "}
                {enrollment?.totalProgress ?? 0}% 완료
              </p>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
              {lectures.map((lecture, idx) => {
                const isActive = lecture.id === currentLecture?.id;
                return (
                  <button
                    key={lecture.id}
                    onClick={() => handleSelectLecture(lecture)}
                    className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 transition-colors flex items-start gap-3 ${
                      isActive
                        ? "bg-orange-500/10 border-l-2 border-l-orange-500"
                        : "hover:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-black mt-0.5 ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium leading-tight ${
                          isActive ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {lecture.title}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1 font-mono">
                        {formatDuration(lecture.duration)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 영역 */}
      <main className="flex-1 min-w-0">
        <>
          {/* 비디오 플레이어 */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-4">
            <div className="aspect-video bg-zinc-950">
              {currentLecture?.videoUrl ? (
                <iframe
                  key={currentLecture.id}
                  src={currentLecture.videoUrl}
                  className="w-full h-full"
                  title={currentLecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                  영상이 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 강의 정보 + 이전/다음 */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {currentLecture ? (
                  <>
                    <p className="text-xs text-zinc-500 mb-1">
                      {currentIndex + 1}강
                    </p>
                    <h2 className="text-lg font-black text-white">
                      {currentLecture.title}
                    </h2>
                    <p className="text-xs text-zinc-600 mt-1 font-mono">
                      {formatDuration(currentLecture.duration)}
                    </p>
                  </>
                ) : (
                  <h2 className="text-lg font-black text-white">테스트 영상</h2>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="text-sm font-bold px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-zinc-700"
                >
                  ← 이전
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    !lectures.length || currentIndex === lectures.length - 1
                  }
                  className="text-sm font-bold px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  다음 →
                </button>
              </div>
            </div>
          </div>
        </>
      </main>
    </div>
  );
}
