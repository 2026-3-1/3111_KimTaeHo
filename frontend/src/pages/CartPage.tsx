import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createPaymentOrder } from "../api/payment";

const TOSS_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

export default function CartPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { items, removeFromCart, clearCart, loading } = useCart();

  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/cart" }, replace: true });
    }
  }, [isLoggedIn, navigate]);

  const checkoutTargets = useMemo(
    () => items.filter((item) => !item.alreadyEnrolled),
    [items],
  );

  const totalPrice = useMemo(
    () => checkoutTargets.reduce((sum, item) => sum + item.price, 0),
    [checkoutTargets],
  );

  const handlePayment = async () => {
    if (!user || checkoutTargets.length === 0) return;
    setPaying(true);
    try {
      const order = await createPaymentOrder(user.id);

      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({
        customerKey: `user_${user.id}`,
      });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: order.amount },
        orderId: order.orderId,
        orderName: order.orderName,
        customerName: order.customerName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (e: any) {
      // 사용자가 결제창을 닫은 경우 (ABORT) 는 무시
      if (e?.code !== "USER_CANCEL") {
        alert(e?.message || "결제 요청 중 오류가 발생했습니다.");
      }
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-500 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (!user || user.role === "TEACHER") {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">
          장바구니는 학생 계정에서만 사용할 수 있습니다.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-orange-500"
        >
          강의 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">장바구니</h1>
          <p className="text-sm text-zinc-500 mt-1">
            결제 후 수강 신청이 완료됩니다.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => clearCart().catch(console.error)}
            className="text-xs px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            전체 비우기
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 rounded-2xl bg-zinc-900">
          <p className="text-zinc-500">장바구니가 비어 있습니다.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-orange-500"
          >
            강의 둘러보기
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.courseId}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-white font-bold truncate">{item.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {item.teacherName} · {item.category} · {item.level}
                  </p>
                  <p className="text-sm text-zinc-300 mt-2">
                    {item.price.toLocaleString()}원
                  </p>
                  {item.alreadyEnrolled && (
                    <p className="text-xs text-emerald-400 mt-2">
                      이미 수강 중인 강의입니다.
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex gap-2">
                  <button
                    onClick={() => navigate(`/courses/${item.courseId}`)}
                    className="text-xs px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                  >
                    상세보기
                  </button>
                  <button
                    onClick={() =>
                      removeFromCart(item.courseId).catch(console.error)
                    }
                    className="text-xs px-3 py-2 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/30 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500">결제 금액</p>
              <p className="text-2xl font-black text-white">
                {totalPrice.toLocaleString()}원
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                결제 대상 {checkoutTargets.length}개
                {items.length !== checkoutTargets.length && (
                  <span className="ml-1 text-emerald-400">
                    (이미 수강 중 {items.length - checkoutTargets.length}개 제외)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handlePayment}
              disabled={paying || checkoutTargets.length === 0}
              className="text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 px-5 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paying ? "결제 진행 중..." : `토스로 결제하기 (${checkoutTargets.length}개)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
