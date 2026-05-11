import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCourseReviewsTeacher,
  getCourseStudents,
  getTeacherCourse,
} from "../api/teacher";
import type { Review } from "../types";
import type { StudentItem } from "../api/teacher";
import ReviewItem from "../components/ReviewItem";

type SortKey = "latest" | "progress_desc" | "progress_asc";

export default function StudentListPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"students" | "reviews">("students");
  const [sort, setSort] = useState<SortKey>("latest");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!courseId) return;
    const id = Number(courseId);
    const load = async () => {
      setLoading(true);
      try {
        const [course, studentList, reviewList] = await Promise.all([
          getTeacherCourse(id),
          getCourseStudents(id),
          getCourseReviewsTeacher(id),
        ]);
        setTitle(course.title);
        setStudents(studentList);
        setReviews(reviewList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const filteredStudents = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    const filtered = lowerKeyword
      ? students.filter(
          (s) =>
            s.userName.toLowerCase().includes(lowerKeyword) ||
            s.userEmail.toLowerCase().includes(lowerKeyword),
        )
      : students;

    const sorted = [...filtered];
    if (sort === "progress_desc") {
      sorted.sort((a, b) => b.totalProgress - a.totalProgress);
    } else if (sort === "progress_asc") {
      sorted.sort((a, b) => a.totalProgress - b.totalProgress);
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
      );
    }
    return sorted;
  }, [students, keyword, sort]);

  const avgProgress =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.totalProgress, 0) /
            students.length,
        )
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-500 text-sm">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/teacher")}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <span>←</span>
        대시보드로
      </button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-xs text-zinc-500 mb-1">강의 관리</p>
        <h1 className="text-2xl font-black text-white">{title}</h1>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <Stat label="수강생" value={`${students.length}명`} />
          <Stat label="리뷰" value={`${reviews.length}개`} />
          <Stat label="평균 진행률" value={`${avgProgress}%`} />
        </div>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {(
          [
            ["students", "수강생"],
            ["reviews", "수강생 댓글"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === key
                ? "border-orange-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "students" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="이름 또는 이메일 검색"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 h-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 h-11 text-sm text-zinc-300 outline-none focus:border-orange-500/50"
            >
              <option value="latest">최신 등록순</option>
              <option value="progress_desc">진행률 높은순</option>
              <option value="progress_asc">진행률 낮은순</option>
            </select>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-16 text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-2xl">
              수강생이 없습니다.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500">
                      이름
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500">
                      이메일
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500">
                      진행률
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500">
                      등록일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.enrollmentId}
                      className="border-b border-zinc-800/60 last:border-0"
                    >
                      <td className="px-5 py-3 text-white font-medium">
                        {s.userName}
                      </td>
                      <td className="px-5 py-3 text-zinc-300">{s.userEmail}</td>
                      <td className="px-5 py-3 text-right text-zinc-300">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${s.totalProgress}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs">
                            {s.totalProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-500 text-xs">
                        {new Date(s.enrolledAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          {reviews.length === 0 ? (
            <p className="text-zinc-600 text-center py-14">
              아직 등록된 댓글이 없습니다.
            </p>
          ) : (
            reviews.map((review) => (
              <ReviewItem key={review.reviewId} review={review} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-800 rounded-xl border border-zinc-700 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-black text-white mt-1">{value}</p>
    </div>
  );
}
