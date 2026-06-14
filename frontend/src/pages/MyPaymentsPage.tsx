import { useEffect, useState } from "react";
import { getMyPayments, refundPayment } from "../api/payment";
import type { PaymentHistory } from "../api/payment";
import { useAuth } from "../context/AuthContext";

const STATUS_META: Record<
  PaymentHistory["status"],
  { label: string; color: string }
> = {
  PAID: {
    label: "결제 완료",
    color: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
  },
  REFUNDED: {
    label: "환불 완료",
    color: "text-zinc-400 bg-zinc-800 border border-zinc-700",
  },
  PENDING: {
    label: "결제 대기",
    color: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
  },
  FAILED: {
    label: "결제 실패",
    color: "text-red-400 bg-red-400/10 border border-red-400/20",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MyPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PaymentHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      setPayments(await getMyPayments(user.id));
    } catch {
      setError("결제 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleRefund = async () => {
    if (!confirmTarget || !user) return;
    setRefunding(confirmTarget.orderId);
    setConfirmTarget(null);
    setError(null);
    try {
      await refundPayment(confirmTarget.orderId, user.id);
      await load();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "환불 처리 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setRefunding(null);
    }
  };

  const paidPayments = payments.filter((p) => p.status !== "PENDING" && p.status !== "FAILED");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-1 tracking-tight">
          결제 내역
        </h1>
        <p className="text-zinc-500 text-sm">
          {!loading && `총 ${paidPayments.length}건의 결제 내역`}
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-800 rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : paidPayments.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-6xl mb-5">🧾</p>
          <p className="text-lg font-black text-zinc-600 mb-2">
            결제 내역이 없어요
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paidPayments.map((payment) => {
            const meta = STATUS_META[payment.status];
            const isRefunding = refunding === payment.orderId;
            return (
              <div
                key={payment.orderId}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
              >
                {/* 헤더 */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-zinc-600 mb-1">
                      {formatDate(payment.createdAt)}
                      {payment.refundedAt && (
                        <span className="ml-2">
                          · 환불 {formatDate(payment.refundedAt)}
                        </span>
                      )}
                    </p>
                    <p className="text-xl font-black text-white">
                      {payment.amount.toLocaleString()}원
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* 강의 목록 */}
                <div className="space-y-2 mb-4">
                  {payment.courses.map((course) => (
                    <div
                      key={course.courseId}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm text-zinc-300 truncate">
                        {course.courseTitle}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${course.progress}%`,
                              backgroundColor:
                                course.progress === 100
                                  ? "#10b981"
                                  : course.progress > 0
                                  ? "#f97316"
                                  : "#3f3f46",
                            }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 w-8 text-right">
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 환불 버튼 */}
                {payment.refundEligible && (
                  <button
                    onClick={() => setConfirmTarget(payment)}
                    disabled={isRefunding}
                    className="text-sm font-bold text-white bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    {isRefunding ? "환불 처리 중..." : "환불 신청"}
                  </button>
                )}
                {payment.status === "PAID" && !payment.refundEligible && (
                  <p className="text-xs text-zinc-600">
                    수강 진행률 초과로 환불이 불가합니다
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 확인 모달 */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm mx-4">
            <h2 className="text-lg font-black text-white mb-2">환불 신청</h2>
            <p className="text-sm text-zinc-400 mb-1">
              {confirmTarget.amount.toLocaleString()}원이 환불됩니다.
            </p>
            <p className="text-xs text-zinc-600 mb-6">
              환불 후 수강 권한이 즉시 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 transition-colors"
              >
                환불 신청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
