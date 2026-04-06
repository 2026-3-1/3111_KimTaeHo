import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function parseJwt(token: string): Record<string, any> {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signupMessage = (location.state as any)?.message ?? "";
  const from = (location.state as any)?.from ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginApi({ email, password });
      const claims = parseJwt(res.accessToken);
      login(res.accessToken, {
        id: claims.id ?? claims.userId ?? Number(claims.sub) ?? 0,
        email: claims.email ?? claims.sub ?? email,
        role: claims.role ?? "STUDENT",
      });
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(
        e.response?.status === 401
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "로그인에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-1">로그인</h1>
          <p className="text-zinc-500 text-sm">DevClass에 오신 것을 환영합니다</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 space-y-4"
        >
          {signupMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <p className="text-emerald-400 text-xs font-medium">{signupMessage}</p>
            </div>
          )}

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

          {error && (
            <p className="text-red-400 text-xs font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            계정이 없으신가요?{" "}
            <Link
              to="/signup"
              className="text-orange-400 hover:text-orange-300 font-semibold"
            >
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
