import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup as signupApi, sendVerificationCode, verifyCode } from "../api/auth";

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setCodeSent(false);
    setEmailVerified(false);
    setVerificationCode("");
    setVerifyError("");
  };

  const handleSendCode = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    setSendingCode(true);
    setError("");
    setVerifyError("");
    try {
      await sendVerificationCode(email);
      setCodeSent(true);
      setEmailVerified(false);
      setVerificationCode("");
    } catch {
      setError("인증 코드 발송에 실패했습니다. 이메일 주소를 확인해주세요.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setVerifyError("인증 코드를 입력해주세요.");
      return;
    }
    setVerifyingCode(true);
    setVerifyError("");
    try {
      await verifyCode(email, verificationCode);
      setEmailVerified(true);
    } catch (e: any) {
      setVerifyError(
        e.response?.status === 400
          ? "인증 코드가 올바르지 않거나 만료되었습니다."
          : "인증에 실패했습니다."
      );
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (!emailVerified) {
      setError("이메일 인증을 완료해주세요.");
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
          : e.response?.status === 400
          ? "이메일 인증을 다시 완료해주세요."
          : "회원가입에 실패했습니다."
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
          {/* 이메일 + 인증 발송 버튼 */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="user@email.com"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || !email || emailVerified}
                className="shrink-0 bg-zinc-700 text-zinc-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {sendingCode ? "발송 중..." : codeSent ? "재발송" : "인증 발송"}
              </button>
            </div>
            {emailVerified && (
              <p className="text-green-400 text-xs font-semibold mt-1.5">
                ✓ 이메일 인증이 완료되었습니다
              </p>
            )}
          </div>

          {/* 인증 코드 입력 */}
          {codeSent && !emailVerified && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                인증 코드
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                  placeholder="6자리 코드 입력"
                  maxLength={6}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors tracking-widest"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || verificationCode.length < 6}
                  className="shrink-0 bg-orange-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {verifyingCode ? "확인 중..." : "인증 확인"}
                </button>
              </div>
              <p className="text-zinc-500 text-xs mt-1.5">
                이메일로 발송된 6자리 코드를 입력해주세요 (5분 유효)
              </p>
              {verifyError && (
                <p className="text-red-400 text-xs font-medium mt-1">
                  {verifyError}
                </p>
              )}
            </div>
          )}

          {/* 비밀번호 */}
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

          {/* 역할 선택 */}
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
            disabled={loading || !emailVerified}
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
