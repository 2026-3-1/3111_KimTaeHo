import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  getAdminStats, getAdminRevenue, getAdminUsers, getAdminCourses,
  getAdminPayments, getAdminReviews, getAdminQuestions,
  changeUserRole, toggleUserActive,
  adminUnpublishCourse, adminDeleteCourse,
  adminRefundPayment,
  adminDeleteReview,
  adminDeleteQuestion,
  sendBroadcastEmail,
  getTeacherApplications,
  approveTeacherApplication,
  rejectTeacherApplication,
} from "../api/admin";
import type {
  AdminStats, AdminRevenue, AdminUser, AdminCourse,
  AdminPayment, AdminReview, AdminQna, TeacherApplication,
} from "../api/admin";

type Tab = "overview" | "users" | "courses" | "payments" | "reviews" | "qna" | "email" | "teacher-apply";

function fmt(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    STUDENT: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    TEACHER: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    PENDING_TEACHER: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    ADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };
  const label: Record<string, string> = {
    STUDENT: "학생", TEACHER: "강사", PENDING_TEACHER: "승인대기", ADMIN: "관리자",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[role] ?? "bg-zinc-700/50 text-zinc-400 border-zinc-700"}`}>
      {label[role] ?? role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    REFUNDED: "bg-zinc-700/50 text-zinc-400 border-zinc-700",
    PARTIALLY_REFUNDED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    PENDING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] ?? "bg-zinc-700/50 text-zinc-400 border-zinc-700"}`}>
      {status}
    </span>
  );
}

function ActionBtn({ label, color = "zinc", onClick, disabled }: {
  label: string; color?: "red" | "orange" | "emerald" | "zinc" | "amber";
  onClick: () => void; disabled?: boolean;
}) {
  const cls: Record<string, string> = {
    red: "border-red-500/30 text-red-400 hover:bg-red-500/10",
    orange: "border-orange-500/30 text-orange-400 hover:bg-orange-500/10",
    emerald: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
    amber: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10",
    zinc: "border-zinc-700 text-zinc-400 hover:bg-zinc-800",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls[color]}`}
    >
      {label}
    </button>
  );
}

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "개요" },
  { key: "users", label: "회원 관리" },
  { key: "courses", label: "강좌 관리" },
  { key: "payments", label: "결제 내역" },
  { key: "reviews", label: "리뷰 관리" },
  { key: "qna", label: "Q&A 관리" },
  { key: "email", label: "이메일 발송" },
  { key: "teacher-apply", label: "강사 신청" },
];

const ROLES = ["STUDENT", "PENDING_TEACHER", "TEACHER", "ADMIN"];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenue, setRevenue] = useState<AdminRevenue[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [questions, setQuestions] = useState<AdminQna[]>([]);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(false);

  // Email form
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [emailTarget, setEmailTarget] = useState("ALL");
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAdminStats(), getAdminRevenue(), getTeacherApplications()])
      .then(([s, r, a]) => { setStats(s); setRevenue(r); setApplications(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "users" && users.length === 0) getAdminUsers().then(setUsers).catch(console.error);
    if (tab === "courses" && courses.length === 0) getAdminCourses().then(setCourses).catch(console.error);
    if (tab === "payments" && payments.length === 0) getAdminPayments().then(setPayments).catch(console.error);
    if (tab === "reviews" && reviews.length === 0) getAdminReviews().then(setReviews).catch(console.error);
    if (tab === "qna" && questions.length === 0) getAdminQuestions().then(setQuestions).catch(console.error);
  }, [tab]);

  const pendingTeachers = users.filter(u => u.role === "PENDING_TEACHER");
  const pendingApplications = applications.filter(a => a.status === "PENDING");

  async function handleApproveApplication(id: number) {
    if (!confirm("강사 신청을 승인하시겠습니까? 신청자에게 승인 이메일이 발송됩니다.")) return;
    await approveTeacherApplication(id).catch(e => { alert(e.response?.data?.message || "실패"); return; });
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "APPROVED" as const } : a));
  }

  async function handleRejectApplication(id: number) {
    const reason = prompt("거절 사유를 입력하세요 (선택사항):");
    if (reason === null) return;
    await rejectTeacherApplication(id, reason || undefined).catch(e => { alert(e.response?.data?.message || "실패"); return; });
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "REJECTED" as const } : a));
  }

  async function handleRoleChange(userId: number, role: string) {
    const updated = await changeUserRole(userId, role).catch(e => { alert(e.response?.data?.message || "실패"); return null; });
    if (updated) setUsers(prev => prev.map(u => u.id === userId ? updated : u));
  }

  async function handleToggleActive(userId: number) {
    const updated = await toggleUserActive(userId).catch(e => { alert(e.response?.data?.message || "실패"); return null; });
    if (updated) setUsers(prev => prev.map(u => u.id === userId ? updated : u));
  }

  async function handleUnpublishCourse(courseId: number) {
    if (!confirm("이 강좌를 강제 비공개 처리하시겠습니까?")) return;
    await adminUnpublishCourse(courseId).catch(e => alert(e.response?.data?.message || "실패"));
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, published: false } : c));
  }

  async function handleDeleteCourse(courseId: number) {
    if (!confirm("이 강좌를 삭제하시겠습니까? 수강 중인 학생에게 환불이 진행됩니다.")) return;
    await adminDeleteCourse(courseId).catch(e => { alert(e.response?.data?.message || "실패"); throw e; });
    setCourses(prev => prev.filter(c => c.id !== courseId));
  }

  async function handleRefund(paymentId: number) {
    if (!confirm("이 결제를 환불하시겠습니까?")) return;
    await adminRefundPayment(paymentId).catch(e => { alert(e.response?.data?.message || "실패"); throw e; });
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: "REFUNDED" } : p));
  }

  async function handleDeleteReview(reviewId: number) {
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
    await adminDeleteReview(reviewId).catch(e => { alert(e.response?.data?.message || "실패"); throw e; });
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!confirm("이 질문을 삭제하시겠습니까?")) return;
    await adminDeleteQuestion(questionId).catch(e => { alert(e.response?.data?.message || "실패"); throw e; });
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  }

  async function handleSendEmail() {
    if (!emailSubject.trim() || !emailContent.trim()) return;
    if (!confirm(`전체 활성 사용자에게 이메일을 발송합니다. 계속하시겠습니까?`)) return;
    setEmailSending(true);
    await sendBroadcastEmail(emailSubject, emailContent, emailTarget)
      .then(() => { alert("발송 요청이 완료되었습니다. 백그라운드에서 순차 발송됩니다."); setEmailSubject(""); setEmailContent(""); })
      .catch(e => alert(e.response?.data?.message || "발송 실패"))
      .finally(() => setEmailSending(false));
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">관리자 대시보드</h1>
        <p className="text-sm text-zinc-500">사이트 전체 현황을 확인하고 관리합니다.</p>
      </div>

      {/* 탭 */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 bg-zinc-900 rounded-xl border border-zinc-800 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t.key ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-white"}`}>
            {t.label}
            {t.key === "teacher-apply" && pendingApplications.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded-full">
                {pendingApplications.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── 개요 ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {loading || !stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "총 회원", value: stats.totalUsers.toLocaleString() + "명", icon: "👤" },
                { label: "총 강좌", value: stats.totalCourses.toLocaleString() + "개", icon: "📚" },
                { label: "총 수강", value: stats.totalEnrollments.toLocaleString() + "건", icon: "🎓" },
                { label: "총 결제", value: stats.totalPayments.toLocaleString() + "건", icon: "💳" },
                { label: "총 수익", value: stats.totalRevenue.toLocaleString() + "원", icon: "💰" },
              ].map(card => (
                <div key={card.label} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
                  <p className="text-2xl mb-3">{card.icon}</p>
                  <p className="text-xs text-zinc-500 mb-1">{card.label}</p>
                  <p className="text-xl font-black text-white">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* 수익 차트 */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-sm font-black text-white mb-5">최근 30일 수익 추이</h2>
            {revenue.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center py-8">데이터가 없습니다.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={revenue} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={v => (v / 1000) + "k"} />
                  <Tooltip
                    contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                    labelStyle={{ color: "#a1a1aa", fontSize: 11 }}
                    formatter={(v) => [Number(v).toLocaleString() + "원", "수익"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 승인 대기 강사 */}
          {pendingApplications.length > 0 && (
            <div className="bg-zinc-900 rounded-2xl border border-amber-500/20 p-6">
              <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                강사 신청 승인 대기
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  {pendingApplications.length}건
                </span>
              </h2>
              <div className="space-y-3">
                {pendingApplications.map(app => (
                  <div key={app.id} className="py-3 px-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{app.userName || app.userEmail}</p>
                        <p className="text-xs text-zinc-500 mb-1">{app.userEmail} · {app.phone} · {fmt(app.createdAt)}</p>
                        <p className="text-xs text-zinc-400 line-clamp-2">{app.introduction}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <ActionBtn label="승인" color="emerald" onClick={() => handleApproveApplication(app.id)} />
                        <ActionBtn label="거절" color="red" onClick={() => handleRejectApplication(app.id)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 회원 관리 ── */}
      {tab === "users" && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <h2 className="text-sm font-black text-white">회원 목록</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">{users.length}명</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="text-left px-5 py-3 font-semibold">ID</th>
                  <th className="text-left px-5 py-3 font-semibold">이름</th>
                  <th className="text-left px-5 py-3 font-semibold">이메일</th>
                  <th className="text-left px-5 py-3 font-semibold">역할</th>
                  <th className="text-left px-5 py-3 font-semibold">상태</th>
                  <th className="text-left px-5 py-3 font-semibold">가입일</th>
                  <th className="text-left px-5 py-3 font-semibold">액션</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-zinc-500 font-mono text-xs">{u.id}</td>
                    <td className="px-5 py-3 text-white font-medium">{u.name || "-"}</td>
                    <td className="px-5 py-3 text-zinc-400 text-xs">{u.email}</td>
                    <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3">
                      {u.active
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">활성</span>
                        : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">정지</span>}
                    </td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{fmt(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {u.role === "PENDING_TEACHER" && (
                          <ActionBtn label="강사 승인" color="emerald" onClick={() => handleRoleChange(u.id, "TEACHER")} />
                        )}
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md px-2 py-1 focus:outline-none"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ActionBtn
                          label={u.active ? "정지" : "활성화"}
                          color={u.active ? "red" : "emerald"}
                          onClick={() => handleToggleActive(u.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-zinc-600 text-sm">회원이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 강좌 관리 ── */}
      {tab === "courses" && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <h2 className="text-sm font-black text-white">강좌 목록</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">{courses.length}개</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="text-left px-5 py-3 font-semibold">ID</th>
                  <th className="text-left px-5 py-3 font-semibold">강좌명</th>
                  <th className="text-left px-5 py-3 font-semibold">강사</th>
                  <th className="text-left px-5 py-3 font-semibold">가격</th>
                  <th className="text-left px-5 py-3 font-semibold">강의수</th>
                  <th className="text-left px-5 py-3 font-semibold">상태</th>
                  <th className="text-left px-5 py-3 font-semibold">액션</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-zinc-500 font-mono text-xs">{c.id}</td>
                    <td className="px-5 py-3 text-white font-medium max-w-xs truncate">{c.title}</td>
                    <td className="px-5 py-3 text-zinc-400">{c.teacherName}</td>
                    <td className="px-5 py-3 text-white font-mono text-xs">{c.price.toLocaleString()}원</td>
                    <td className="px-5 py-3 text-zinc-400">{c.lectureCount}강</td>
                    <td className="px-5 py-3">
                      {c.published
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">발행됨</span>
                        : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-500 border border-zinc-700">임시저장</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        {c.published && (
                          <ActionBtn label="비공개" color="amber" onClick={() => handleUnpublishCourse(c.id)} />
                        )}
                        <ActionBtn label="삭제" color="red" onClick={() => handleDeleteCourse(c.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-zinc-600 text-sm">강좌가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 결제 내역 ── */}
      {tab === "payments" && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <h2 className="text-sm font-black text-white">결제 내역</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">{payments.length}건</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="text-left px-5 py-3 font-semibold">주문ID</th>
                  <th className="text-left px-5 py-3 font-semibold">회원ID</th>
                  <th className="text-left px-5 py-3 font-semibold">금액</th>
                  <th className="text-left px-5 py-3 font-semibold">강좌IDs</th>
                  <th className="text-left px-5 py-3 font-semibold">상태</th>
                  <th className="text-left px-5 py-3 font-semibold">결제일</th>
                  <th className="text-left px-5 py-3 font-semibold">액션</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-zinc-400 font-mono text-xs max-w-30 truncate">{p.orderId}</td>
                    <td className="px-5 py-3 text-zinc-400 font-mono text-xs">{p.userId}</td>
                    <td className="px-5 py-3 text-white font-mono font-bold text-xs">{p.amount.toLocaleString()}원</td>
                    <td className="px-5 py-3 text-zinc-500 font-mono text-xs">{p.courseIds}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{fmt(p.createdAt)}</td>
                    <td className="px-5 py-3">
                      {(p.status === "PAID" || p.status === "PARTIALLY_REFUNDED") && (
                        <ActionBtn label="수동 환불" color="orange" onClick={() => handleRefund(p.id)} />
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-zinc-600 text-sm">결제 내역이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 리뷰 관리 ── */}
      {tab === "reviews" && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <h2 className="text-sm font-black text-white">리뷰 목록</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">{reviews.length}개</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="text-left px-5 py-3 font-semibold">ID</th>
                  <th className="text-left px-5 py-3 font-semibold">작성자</th>
                  <th className="text-left px-5 py-3 font-semibold">강좌</th>
                  <th className="text-left px-5 py-3 font-semibold">평점</th>
                  <th className="text-left px-5 py-3 font-semibold">내용</th>
                  <th className="text-left px-5 py-3 font-semibold">작성일</th>
                  <th className="text-left px-5 py-3 font-semibold">액션</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-zinc-500 font-mono text-xs">{r.id}</td>
                    <td className="px-5 py-3 text-white font-medium">{r.userName}</td>
                    <td className="px-5 py-3 text-zinc-400 max-w-40 truncate text-xs">{r.courseTitle}</td>
                    <td className="px-5 py-3">
                      <span className="text-amber-400 font-bold text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </td>
                    <td className="px-5 py-3 text-zinc-400 max-w-50 truncate text-xs">{r.comment}</td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{fmt(r.createdAt)}</td>
                    <td className="px-5 py-3">
                      <ActionBtn label="삭제" color="red" onClick={() => handleDeleteReview(r.id)} />
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-zinc-600 text-sm">리뷰가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Q&A 관리 ── */}
      {tab === "qna" && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <h2 className="text-sm font-black text-white">Q&A 목록</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">{questions.length}개</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="text-left px-5 py-3 font-semibold">ID</th>
                  <th className="text-left px-5 py-3 font-semibold">작성자</th>
                  <th className="text-left px-5 py-3 font-semibold">강좌</th>
                  <th className="text-left px-5 py-3 font-semibold">제목</th>
                  <th className="text-left px-5 py-3 font-semibold">답변수</th>
                  <th className="text-left px-5 py-3 font-semibold">작성일</th>
                  <th className="text-left px-5 py-3 font-semibold">액션</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-zinc-500 font-mono text-xs">{q.id}</td>
                    <td className="px-5 py-3 text-white font-medium">{q.authorName}</td>
                    <td className="px-5 py-3 text-zinc-400 max-w-40 truncate text-xs">{q.courseTitle}</td>
                    <td className="px-5 py-3 text-zinc-300 max-w-50 truncate text-xs">{q.title}</td>
                    <td className="px-5 py-3 text-zinc-400">{q.answerCount}</td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{fmt(q.createdAt)}</td>
                    <td className="px-5 py-3">
                      <ActionBtn label="삭제" color="red" onClick={() => handleDeleteQuestion(q.id)} />
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-zinc-600 text-sm">질문이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 강사 신청 관리 ── */}
      {tab === "teacher-apply" && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <h2 className="text-sm font-black text-white">강사 신청 목록</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">{applications.length}건</span>
            {pendingApplications.length > 0 && (
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                대기 {pendingApplications.length}건
              </span>
            )}
          </div>
          <div className="divide-y divide-zinc-800/50">
            {applications.map(app => (
              <div key={app.id} className="px-6 py-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{app.userName || "-"}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        app.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : app.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}>
                        {app.status === "PENDING" ? "심사 중" : app.status === "APPROVED" ? "승인됨" : "거절됨"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">
                      {app.userEmail} · 📞 {app.phone} · 신청일 {fmt(app.createdAt)}
                      {app.reviewedAt && ` · 처리일 ${fmt(app.reviewedAt)}`}
                    </p>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{app.introduction}</p>
                    {app.rejectReason && (
                      <p className="text-xs text-red-400 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
                        거절 사유: {app.rejectReason}
                      </p>
                    )}
                  </div>
                  {app.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <ActionBtn label="승인" color="emerald" onClick={() => handleApproveApplication(app.id)} />
                      <ActionBtn label="거절" color="red" onClick={() => handleRejectApplication(app.id)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <div className="text-center py-12 text-zinc-600 text-sm">강사 신청이 없습니다.</div>
            )}
          </div>
        </div>
      )}

      {/* ── 이메일 일괄 발송 ── */}
      {tab === "email" && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-2xl">
          <h2 className="text-sm font-black text-white mb-1">전체 이메일 발송</h2>
          <p className="text-xs text-zinc-500 mb-6">모든 활성 회원에게 이메일을 발송합니다. HTML 태그를 사용할 수 있습니다.</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 font-semibold block mb-1.5">발송 대상</label>
              <div className="flex gap-3">
                {[
                  { value: "ALL", label: "전체 회원" },
                  { value: "STUDENT", label: "학생만" },
                  { value: "TEACHER", label: "강사만" },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="emailTarget"
                      value={opt.value}
                      checked={emailTarget === opt.value}
                      onChange={() => setEmailTarget(opt.value)}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-zinc-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-semibold block mb-1.5">제목</label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="이메일 제목을 입력하세요"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-semibold block mb-1.5">내용 (HTML 지원)</label>
              <textarea
                value={emailContent}
                onChange={e => setEmailContent(e.target.value)}
                placeholder="<p>안녕하세요, DevClass입니다.</p>"
                rows={10}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none font-mono"
              />
            </div>
            <button
              onClick={handleSendEmail}
              disabled={emailSending || !emailSubject.trim() || !emailContent.trim()}
              className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailSending ? "발송 요청 중..." : "전체 발송"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
