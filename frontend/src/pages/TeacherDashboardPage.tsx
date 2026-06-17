import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTeacherCourses,
  getCourseStats,
  getDailyEnrollments,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getTeacherQuestions,
  createTeacherAnswer,
} from "../api/teacher";
import type {
  TeacherCourse,
  CourseStatsItem,
  DailyEnrollment,
  TeacherQuestionItem,
} from "../api/teacher";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [stats, setStats] = useState<CourseStatsItem[]>([]);
  const [daily, setDaily] = useState<DailyEnrollment[]>([]);
  const [questions, setQuestions] = useState<TeacherQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"courses" | "stats" | "qna">("courses");

  useEffect(() => {
    if (user && user.role !== "TEACHER") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [c, s, d, q] = await Promise.all([
          getTeacherCourses(),
          getCourseStats(),
          getDailyEnrollments(),
          getTeacherQuestions(),
        ]);
        setCourses(c);
        setStats(s);
        setDaily(d);
        setQuestions(q);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalStudents = stats.reduce((s, c) => s + c.enrollmentCount, 0);
  const totalReviews = stats.reduce((s, c) => s + c.reviewCount, 0);
  const avgRating =
    stats.length > 0
      ? (stats.reduce((s, c) => s + c.averageRating, 0) / stats.length).toFixed(
          1,
        )
      : "0.0";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500 text-sm">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">강사 대시보드</h1>
          <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/teacher/profile")}
            className="text-sm px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          >
            프로필 수정
          </button>
          <button
            onClick={() => navigate("/teacher/courses/new")}
            className="text-sm px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors"
          >
            + 강의 등록
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "내 강의", value: courses.length, unit: "개" },
          { label: "총 수강생", value: totalStudents, unit: "명" },
          { label: "총 리뷰", value: totalReviews, unit: "개" },
          { label: "평균 평점", value: avgRating, unit: "점" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5"
          >
            <p className="text-xs text-zinc-500 font-medium">{card.label}</p>
            <p className="text-3xl font-black text-white mt-1">
              {card.value}
              <span className="text-base text-zinc-500 ml-1">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-zinc-800">
        {(["courses", "stats", "qna"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-orange-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "courses" ? "내 강의" : t === "stats" ? "통계" : `Q&A${questions.length > 0 ? ` (${questions.length})` : ""}`}
          </button>
        ))}
      </div>

      {tab === "courses" ? (
        <CourseList
          courses={courses}
          onRefresh={() => getTeacherCourses().then(setCourses)}
        />
      ) : tab === "stats" ? (
        <StatsView stats={stats} daily={daily} />
      ) : (
        <QnaView
          questions={questions}
          onRefresh={() => getTeacherQuestions().then(setQuestions)}
        />
      )}
    </div>
  );
}

function CourseList({
  courses,
  onRefresh,
}: {
  courses: TeacherCourse[];
  onRefresh: () => void;
}) {
  const navigate = useNavigate();
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const handleDelete = async (courseId: number, title: string) => {
    if (
      !confirm(
        `"${title}" 강의를 삭제하시겠습니까?\n수강 중인 학생이 있으면 자동으로 환불 처리됩니다.\n삭제하면 되돌릴 수 없습니다.`,
      )
    )
      return;
    try {
      await deleteCourse(courseId);
      onRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message || "삭제 실패");
    }
  };

  const handleTogglePublish = async (course: TeacherCourse) => {
    if (publishingId) return;
    setPublishingId(course.id);
    try {
      if (course.published) {
        await unpublishCourse(course.id);
      } else {
        await publishCourse(course.id);
      }
      onRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message || "처리 실패");
    } finally {
      setPublishingId(null);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-600">
        <p className="text-lg font-bold">아직 등록한 강의가 없습니다</p>
        <p className="text-sm mt-1">
          강의 등록 버튼으로 첫 강의를 만들어보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-white truncate">{course.title}</p>
              {course.published ? (
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  발행됨
                </span>
              ) : (
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 border border-zinc-700">
                  임시저장
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
              <span>{course.category}</span>
              <span>·</span>
              <span>{course.level}</span>
              <span>·</span>
              <span>{course.price.toLocaleString()}원</span>
              <span>·</span>
              <span>영상 {course.lectures.length}개</span>
              <span>·</span>
              <span>수강생 {course.enrollmentCount}명</span>
              <span>·</span>
              <span>⭐ {Number(course.averageRating).toFixed(1)}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleTogglePublish(course)}
              disabled={publishingId === course.id || (!course.published && course.lectures.length === 0)}
              title={!course.published && course.lectures.length === 0 ? "강의 영상을 먼저 추가해주세요" : ""}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                course.published
                  ? "border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400"
                  : "border-emerald-700 text-emerald-400 hover:bg-emerald-900/30"
              }`}
            >
              {publishingId === course.id ? "처리 중..." : course.published ? "발행 취소" : "발행"}
            </button>
            <button
              onClick={() => navigate(`/teacher/courses/${course.id}/students`)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
            >
              수강생
            </button>
            <button
              onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
            >
              수정
            </button>
            <button
              onClick={() => handleDelete(course.id, course.title)}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/30 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QnaView({
  questions,
  onRefresh,
}: {
  questions: TeacherQuestionItem[];
  onRefresh: () => void;
}) {
  const [answerInputs, setAnswerInputs] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-600">
        <p className="text-lg font-bold">아직 등록된 질문이 없습니다</p>
      </div>
    );
  }

  const handleSubmitAnswer = async (questionId: number) => {
    const content = answerInputs[questionId]?.trim();
    if (!content) return;
    setSubmitting(questionId);
    try {
      await createTeacherAnswer(questionId, content);
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
      onRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message || "답변 등록 실패");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const isOpen = expanded === q.id;
        const hasAnswer = q.answers.length > 0;
        return (
          <div
            key={q.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : q.id)}
              className="w-full text-left p-5 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                    {q.courseTitle}
                  </span>
                  {hasAnswer && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                      답변완료
                    </span>
                  )}
                </div>
                <p className="font-semibold text-white truncate">{q.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {q.authorName} · {new Date(q.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <span className="text-zinc-500 shrink-0 mt-1">{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 border-t border-zinc-800">
                <p className="text-sm text-zinc-300 py-4 whitespace-pre-wrap">{q.content}</p>

                {q.answers.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {q.answers.map((a) => (
                      <div
                        key={a.id}
                        className="bg-zinc-800/60 rounded-xl p-4 border-l-2 border-orange-500"
                      >
                        <p className="text-xs text-orange-400 font-semibold mb-1">
                          {a.authorName} (강사)
                        </p>
                        <p className="text-sm text-zinc-200 whitespace-pre-wrap">{a.content}</p>
                        <p className="text-xs text-zinc-600 mt-2">
                          {new Date(a.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <textarea
                    value={answerInputs[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder="답변을 입력하세요..."
                    rows={3}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                  <button
                    onClick={() => handleSubmitAnswer(q.id)}
                    disabled={submitting === q.id || !answerInputs[q.id]?.trim()}
                    className="shrink-0 self-end bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting === q.id ? "등록 중..." : "답변 등록"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatsView({
  stats,
  daily,
}: {
  stats: CourseStatsItem[];
  daily: DailyEnrollment[];
}) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-600">
        <p className="text-lg font-bold">통계를 표시할 강의가 없습니다</p>
      </div>
    );
  }

  // 날짜별 누적 수강생 계산
  const dailyWithCumulative = daily.reduce<
    { date: string; daily: number; cumulative: number }[]
  >((acc, cur) => {
    const prev = acc[acc.length - 1]?.cumulative ?? 0;
    acc.push({
      date: cur.date.slice(5),
      daily: cur.count,
      cumulative: prev + cur.count,
    });
    return acc;
  }, []);

  const barData = stats.map((s) => ({
    name: s.title.length > 10 ? s.title.slice(0, 10) + "…" : s.title,
    수강생: s.enrollmentCount,
    평점: Number(s.averageRating),
    진행률: s.avgProgress,
  }));

  const tooltipStyle = {
    backgroundColor: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: "12px",
    color: "#fff",
  };

  return (
    <div className="space-y-6">
      {/* 날짜별 수강생 추이 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-sm font-bold text-white mb-1">수강생 증가 추이</p>
        <p className="text-xs text-zinc-500 mb-5">
          날짜별 신규 수강생 및 누적 수강생
        </p>
        {daily.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">
            아직 수강생 데이터가 없습니다
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyWithCumulative}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
              <Line
                type="monotone"
                dataKey="daily"
                name="신규 수강생"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="누적 수강생"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ fill: "#60a5fa", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 강의별 수강생 수 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-sm font-bold text-white mb-1">강의별 수강생</p>
        <p className="text-xs text-zinc-500 mb-5">강의별 총 수강생 수</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="수강생" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 강의별 평점 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-sm font-bold text-white mb-1">강의별 평균 평점</p>
        <p className="text-xs text-zinc-500 mb-5">5점 만점 기준</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} />
            <YAxis domain={[0, 5]} tick={{ fill: "#71717a", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="평점" fill="#60a5fa" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 강의별 평균 진행률 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-sm font-bold text-white mb-1">강의별 평균 진행률</p>
        <p className="text-xs text-zinc-500 mb-5">
          수강생 평균 학습 진행률 (%)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            <Bar dataKey="진행률" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 강의별 상세 수치 테이블 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500">
                강의명
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500">
                수강생
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500">
                평점
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500">
                리뷰
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500">
                평균 진행률
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((item) => (
              <tr
                key={item.courseId}
                className="border-b border-zinc-800/50 last:border-0"
              >
                <td className="px-5 py-3 text-white font-medium">
                  {item.title}
                </td>
                <td className="px-5 py-3 text-right text-zinc-300">
                  {item.enrollmentCount}명
                </td>
                <td className="px-5 py-3 text-right text-zinc-300">
                  ⭐ {Number(item.averageRating).toFixed(1)}
                </td>
                <td className="px-5 py-3 text-right text-zinc-300">
                  {item.reviewCount}개
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${item.avgProgress}%` }}
                      />
                    </div>
                    <span className="text-zinc-300 text-xs font-mono w-8 text-right">
                      {item.avgProgress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
