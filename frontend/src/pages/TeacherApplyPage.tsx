import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applyForTeacher } from "../api/teacher";

export default function TeacherApplyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (user?.role === "TEACHER" || user?.role === "ADMIN") {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-zinc-400">이미 강사 또는 관리자 계정입니다.</p>
      </div>
    );
  }

  if (user?.role === "PENDING_TEACHER") {
    return (
      <div className="max-w-lg mx-auto py-20">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
          <p className="text-2xl mb-3">⏳</p>
          <h2 className="text-lg font-black text-white mb-2">강사 신청 심사 중</h2>
          <p className="text-sm text-zinc-400">관리자가 신청서를 검토하고 있습니다.<br />승인되면 이메일로 안내드립니다.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto py-20">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <p className="text-2xl mb-3">✅</p>
          <h2 className="text-lg font-black text-white mb-2">신청이 접수되었습니다!</h2>
          <p className="text-sm text-zinc-400 mb-6">관리자 검토 후 이메일로 결과를 알려드립니다.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const phoneClean = phone.replace(/-/g, "");
    if (!/^\d{10,11}$/.test(phoneClean)) {
      setError("전화번호는 숫자만 10~11자리로 입력해주세요.");
      return;
    }
    if (introduction.trim().length < 20) {
      setError("소개글은 20자 이상 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await applyForTeacher(phoneClean, introduction.trim());
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">강사 신청</h1>
        <p className="text-sm text-zinc-500">신청서를 작성하면 관리자 검토 후 강사 자격이 부여됩니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 space-y-5">
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">이름</label>
          <input
            value={user?.name || ""}
            readOnly
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">이메일</label>
          <input
            value={user?.email || ""}
            readOnly
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            전화번호 <span className="text-orange-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
            강사 소개 <span className="text-orange-500">*</span>
            <span className="text-zinc-600 font-normal ml-1">({introduction.length}/1000, 최소 20자)</span>
          </label>
          <textarea
            value={introduction}
            onChange={e => setIntroduction(e.target.value)}
            placeholder="강사 경력, 전문 분야, 수강생에게 전하고 싶은 말 등을 자유롭게 작성해주세요."
            rows={6}
            maxLength={1000}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "신청 중..." : "강사 신청하기"}
        </button>
      </form>
    </div>
  );
}
