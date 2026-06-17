import { useState } from "react";
import type { QnaQuestion } from "../api/course";
import {
  createAnswer,
  createQuestion,
  deleteAnswer,
  deleteQuestion,
} from "../api/course";
import { useAuth } from "../context/AuthContext";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function QnaSection({
  courseId,
  teacherId,
  questions: initialQuestions,
  onRefresh,
}: {
  courseId: number;
  teacherId: number;
  questions: QnaQuestion[];
  onRefresh: () => void;
}) {
  const { user, isLoggedIn } = useAuth();
  const isTeacher = user?.id === teacherId;

  const [questions, setQuestions] = useState<QnaQuestion[]>(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [answerContent, setAnswerContent] = useState<Record<number, string>>({});
  const [answeringId, setAnsweringId] = useState<number | null>(null);

  const handleCreateQuestion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      const q = await createQuestion(courseId, {
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      setQuestions([q, ...questions]);
      setNewTitle("");
      setNewContent("");
      setShowForm(false);
    } catch (e: any) {
      alert(e.response?.data?.message || "질문 등록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("질문을 삭제하시겠습니까?")) return;
    try {
      await deleteQuestion(questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (e: any) {
      alert(e.response?.data?.message || "삭제 실패");
    }
  };

  const handleCreateAnswer = async (questionId: number) => {
    const content = answerContent[questionId]?.trim();
    if (!content) return;
    setAnsweringId(questionId);
    try {
      const updated = await createAnswer(questionId, { content });
      setQuestions(questions.map((q) => (q.id === questionId ? updated : q)));
      setAnswerContent((prev) => ({ ...prev, [questionId]: "" }));
    } catch (e: any) {
      alert(e.response?.data?.message || "답변 등록 실패");
    } finally {
      setAnsweringId(null);
    }
  };

  const handleDeleteAnswer = async (questionId: number, answerId: number) => {
    if (!confirm("답변을 삭제하시겠습니까?")) return;
    try {
      await deleteAnswer(answerId);
      setQuestions(
        questions.map((q) =>
          q.id === questionId
            ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
            : q,
        ),
      );
    } catch (e: any) {
      alert(e.response?.data?.message || "삭제 실패");
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          Q&A
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
            {questions.length}개
          </span>
        </h2>
        {isLoggedIn && !isTeacher && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors"
          >
            {showForm ? "취소" : "질문하기"}
          </button>
        )}
      </div>

      {/* 질문 작성 폼 */}
      {showForm && (
        <div className="mb-6 p-4 bg-zinc-800 rounded-xl border border-zinc-700 space-y-3">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={200}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <textarea
            placeholder="질문 내용을 입력하세요"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleCreateQuestion}
              disabled={submitting || !newTitle.trim() || !newContent.trim()}
              className="text-xs px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>
      )}

      {/* 질문 목록 */}
      {questions.length === 0 ? (
        <p className="text-sm text-zinc-600 text-center py-8">
          아직 질문이 없습니다. 첫 번째로 질문해보세요!
        </p>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="border border-zinc-800 rounded-xl overflow-hidden">
              {/* 질문 헤더 */}
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full flex items-start justify-between gap-3 p-4 hover:bg-zinc-800/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {q.answers.length > 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                        답변완료
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-500 border border-zinc-700 shrink-0">
                        미답변
                      </span>
                    )}
                    <p className="text-sm font-semibold text-white truncate">{q.title}</p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {q.authorName} · {formatDate(q.createdAt)}
                  </p>
                </div>
                <span className="text-zinc-500 text-xs shrink-0 mt-0.5">
                  {expandedId === q.id ? "▲" : "▼"}
                </span>
              </button>

              {/* 질문 상세 */}
              {expandedId === q.id && (
                <div className="border-t border-zinc-800">
                  <div className="p-4 bg-zinc-800/30">
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {q.content}
                    </p>
                    {user?.id === q.authorId && (
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="mt-3 text-xs text-red-500 hover:text-red-400 transition-colors"
                      >
                        질문 삭제
                      </button>
                    )}
                  </div>

                  {/* 답변 목록 */}
                  {q.answers.map((a) => (
                    <div key={a.id} className="border-t border-zinc-800 p-4 bg-zinc-800/50 flex gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                        <span className="text-orange-400 text-xs font-black">A</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-orange-400 mb-1">
                          {a.authorName} (강사) · {formatDate(a.createdAt)}
                        </p>
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {a.content}
                        </p>
                        {user?.id === a.authorId && (
                          <button
                            onClick={() => handleDeleteAnswer(q.id, a.id)}
                            className="mt-2 text-xs text-red-500 hover:text-red-400 transition-colors"
                          >
                            답변 삭제
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* 강사 답변 작성 */}
                  {isTeacher && (
                    <div className="border-t border-zinc-800 p-4 bg-zinc-800/20">
                      <textarea
                        placeholder="답변을 입력하세요"
                        value={answerContent[q.id] ?? ""}
                        onChange={(e) =>
                          setAnswerContent((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none mb-2"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCreateAnswer(q.id)}
                          disabled={answeringId === q.id || !answerContent[q.id]?.trim()}
                          className="text-xs px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {answeringId === q.id ? "등록 중..." : "답변 등록"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
