import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCourse,
  updateCourse,
  getTeacherCourse,
  addLecture,
  deleteLecture,
} from "../api/teacher";
import type { TeacherLecture } from "../api/teacher";

const CATEGORIES = [
  "프론트엔드",
  "백엔드",
  "데이터사이언스",
  "DevOps / 인프라",
  "알고리즘 / CS 기초",
  "모바일",
];
const LEVELS = ["입문", "초급", "중급", "고급"];

type LectureForm = {
  id?: number;
  title: string;
  videoUrl: string;
  duration: string;
  sequence: string;
};

export default function CourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const isEdit = !!courseId;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState(LEVELS[0]);

  const [lectures, setLectures] = useState<LectureForm[]>([]);
  const [newLecture, setNewLecture] = useState<LectureForm>({
    title: "",
    videoUrl: "",
    duration: "",
    sequence: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getTeacherCourse(Number(courseId))
      .then((course) => {
        setTitle(course.title);
        setDescription(course.description ?? "");
        setPrice(String(course.price));
        setCategory(course.category);
        setLevel(course.level);
        setLectures(
          course.lectures.map((l) => ({
            id: l.id,
            title: l.title,
            videoUrl: l.videoUrl,
            duration: String(l.duration),
            sequence: String(l.sequence),
          })),
        );
      })
      .catch(() => setError("강의 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSave = async () => {
    if (!title.trim()) return setError("제목을 입력해주세요.");
    if (!price || isNaN(Number(price)))
      return setError("가격을 올바르게 입력해주세요.");
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await updateCourse(Number(courseId), {
          title,
          description,
          price: Number(price),
          category,
          level,
        });
        alert("강의 정보가 수정되었습니다.");
      } else {
        const created = await createCourse({
          title,
          description,
          price: Number(price),
          category,
          level,
          lectures: lectures.map((l) => ({
            title: l.title,
            videoUrl: l.videoUrl,
            duration: Number(l.duration) || 0,
            sequence: Number(l.sequence) || 0,
          })),
        });
        alert("강의가 등록되었습니다.");
        navigate(`/teacher/courses/${created.id}/edit`);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLecture = async () => {
    if (!newLecture.title.trim() || !newLecture.videoUrl.trim()) {
      return setError("영상 제목과 URL을 입력해주세요.");
    }
    setError("");
    if (isEdit) {
      try {
        const added = await addLecture(Number(courseId), {
          title: newLecture.title,
          videoUrl: newLecture.videoUrl,
          duration: Number(newLecture.duration) || 0,
          sequence: Number(newLecture.sequence) || lectures.length + 1,
        });
        setLectures((prev) => [
          ...prev,
          {
            id: added.id,
            title: added.title,
            videoUrl: added.videoUrl,
            duration: String(added.duration),
            sequence: String(added.sequence),
          },
        ]);
      } catch (e: any) {
        setError(e.response?.data?.message || "영상 추가 실패");
        return;
      }
    } else {
      setLectures((prev) => [
        ...prev,
        { ...newLecture, sequence: String(prev.length + 1) },
      ]);
    }
    setNewLecture({ title: "", videoUrl: "", duration: "", sequence: "" });
  };

  const handleDeleteLecture = async (index: number) => {
    const lec = lectures[index];
    if (isEdit && lec.id) {
      try {
        await deleteLecture(Number(courseId), lec.id);
      } catch (e: any) {
        setError(e.response?.data?.message || "영상 삭제 실패");
        return;
      }
    }
    setLectures((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500 text-sm">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/teacher")}
          className="text-xs text-zinc-500 hover:text-white transition-colors"
        >
          ← 대시보드
        </button>
        <h1 className="text-xl font-black text-white">
          {isEdit ? "강의 수정" : "강의 등록"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 기본 정보 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-zinc-300">기본 정보</h2>

        <div>
          <label className="text-xs text-zinc-500 mb-1 block">
            강의 제목 *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="강의 제목을 입력하세요"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-1 block">강의 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="강의 설명을 입력하세요"
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">
              가격 (원) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="39000"
              min={0}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">난이도</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-colors"
        >
          {saving ? "저장 중..." : isEdit ? "강의 정보 저장" : "강의 등록"}
        </button>
      </div>

      {/* 커리큘럼 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-zinc-300">
          커리큘럼 ({lectures.length}개)
          {!isEdit && (
            <span className="ml-2 text-zinc-600 font-normal">
              — 등록 후 영상을 추가할 수도 있습니다
            </span>
          )}
        </h2>

        {lectures.length > 0 && (
          <div className="space-y-2">
            {lectures.map((lec, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3"
              >
                <span className="w-6 h-6 rounded-full bg-zinc-700 text-xs flex items-center justify-center text-zinc-400 font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {lec.title}
                  </p>
                  <p className="text-xs text-zinc-600 truncate">
                    {lec.videoUrl}
                  </p>
                </div>
                <span className="text-xs text-zinc-600 shrink-0">
                  {lec.duration}초
                </span>
                <button
                  onClick={() => handleDeleteLecture(idx)}
                  className="text-xs text-red-500 hover:text-red-400 shrink-0 transition-colors"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border border-zinc-700 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-400">영상 추가</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={newLecture.title}
              onChange={(e) =>
                setNewLecture((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="영상 제목 *"
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              value={newLecture.duration}
              onChange={(e) =>
                setNewLecture((p) => ({ ...p, duration: e.target.value }))
              }
              placeholder="길이 (초)"
              min={0}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>
          <input
            value={newLecture.videoUrl}
            onChange={(e) =>
              setNewLecture((p) => ({ ...p, videoUrl: e.target.value }))
            }
            placeholder="영상 URL * (YouTube embed URL 등)"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={handleAddLecture}
            className="w-full py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm font-medium transition-colors"
          >
            + 영상 추가
          </button>
        </div>
      </div>
    </div>
  );
}
