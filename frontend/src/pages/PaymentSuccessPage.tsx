import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { confirmPayment } from "../api/payment";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refresh } = useCart();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;
    confirmed.current = true;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount || !user) {
      setStatus("error");
      setErrorMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    confirmPayment({
      paymentKey,
      orderId,
      amount: Number(amount),
      userId: user.id,
    })
      .then((result) => {
        setEnrolledCount(result.enrolledCount);
        setStatus("success");
        refresh().catch(console.error);
      })
      .catch((e) => {
        setStatus("error");
        setErrorMessage(
          e.response?.data?.message || "결제 승인 중 오류가 발생했습니다.",
        );
      });
  }, [searchParams, user, refresh]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">결제를 확인하는 중입니다...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
          <span className="text-3xl">✕</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-white">결제 실패</h1>
          <p className="text-zinc-500 text-sm mt-2">{errorMessage}</p>
        </div>
        <button
          onClick={() => navigate("/cart")}
          className="text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 px-6 py-3 rounded-xl transition-colors"
        >
          장바구니로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
        <span className="text-3xl">✓</span>
      </div>
      <div>
        <h1 className="text-2xl font-black text-white">결제 완료!</h1>
        <p className="text-zinc-400 text-sm mt-2">
          총 {enrolledCount}개 강의 수강 신청이 완료되었습니다.
        </p>
      </div>
      <button
        onClick={() => navigate("/my")}
        className="text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 px-6 py-3 rounded-xl transition-colors"
      >
        내 강의 보기
      </button>
    </div>
  );
}
