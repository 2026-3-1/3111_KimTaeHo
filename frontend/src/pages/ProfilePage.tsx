import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../api/teacher";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setName(p.name);
        setBio(p.bio);
        setEmail(p.email);
        setRole(p.role);
      })
      .catch(() => setError("프로필을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await updateProfile({ name, bio });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500 text-sm">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/teacher")}
          className="text-xs text-zinc-500 hover:text-white transition-colors"
        >
          ← 대시보드
        </button>
        <h1 className="text-xl font-black text-white">프로필 수정</h1>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-950/50 border border-green-800 rounded-xl px-4 py-3 text-sm text-green-400">
          프로필이 저장되었습니다.
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">이메일</label>
          <p className="text-sm text-zinc-400 bg-zinc-800/50 rounded-xl px-4 py-2.5">
            {email}
          </p>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">역할</label>
          <p className="text-sm text-zinc-400 bg-zinc-800/50 rounded-xl px-4 py-2.5">
            {role === "TEACHER" ? "강사" : "학생"}
          </p>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="표시될 이름을 입력하세요"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">소개글</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="강사 소개글을 입력하세요"
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold text-sm transition-colors"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
