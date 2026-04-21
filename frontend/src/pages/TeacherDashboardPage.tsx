import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTeacherCourses,
  getCourseStats,
  getDailyEnrollments,
  deleteCourse,
} from "../api/teacher";
import type {
  TeacherCourse,
  CourseStatsItem,
  DailyEnrollment,
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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"courses" | "stats">("courses");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [c, s, d] = await Promise.all([
          getTeacherCourses(),
          getCourseStats(),
          getDailyEnrollments(),
        ]);
        setCourses(c);
        setStats(s);
        setDaily(d);
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
        {(["courses", "stats"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-orange-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "courses" ? "내 강의" : "통계"}
          </button>
        ))}
      </div>

      {tab === "courses" ? (
        <CourseList
          courses={courses}
          onRefresh={() => getTeacherCourses().then(setCourses)}
        />
      ) : (
        <StatsView stats={stats} daily={daily} />
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

  const handleDelete = async (courseId: number, title: string) => {
    if (
      !confirm(
        `"${title}" 강의를 삭제하시겠습니까?\n삭제하면 되돌릴 수 없습니다.`,
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
            <p className="font-bold text-white truncate">{course.title}</p>
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
            {/* TODO: 이미 수강 중인 학생이 있을 때 삭제 요청 보내면 500 에러 발생 -> 백엔드 수정해야함. */}
          </div>
        </div>
      ))}
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
