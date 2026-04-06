import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup as signupApi } from "../api/auth";

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signupApi({ email, password, role });
      navigate("/login", {
        state: { message: "회원가입이 완료되었습니다. 로그인해주세요." },
      });
    } catch (e: any) {
      setError(
        e.response?.status === 409
          ? "이미 사용 중인 이메일입니다."
          : "회원가입에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-1">회원가입</h1>
          <p className="text-zinc-500 text-sm">
            DevClass와 함께 개발 학습을 시작하세요
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@email.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">
              역할 선택
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["STUDENT", "TEACHER"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                    role === r
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {r === "STUDENT" ? "🎓 학생" : "👨‍🏫 강사"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="text-orange-400 hover:text-orange-300 font-semibold"
            >
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
