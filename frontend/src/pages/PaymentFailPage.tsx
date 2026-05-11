import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentFailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const message =
    searchParams.get("message") || "결제가 취소되었거나 오류가 발생했습니다.";
  const code = searchParams.get("code");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
        <span className="text-3xl text-red-400">✕</span>
      </div>
      <div>
        <h1 className="text-2xl font-black text-white">결제 실패</h1>
        <p className="text-zinc-400 text-sm mt-2">{message}</p>
        {code && <p className="text-zinc-600 text-xs mt-1">코드: {code}</p>}
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
