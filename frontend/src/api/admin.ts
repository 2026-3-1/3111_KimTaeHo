import api from "./axios";

export type AdminStats = {
  totalUsers: number;
  totalCourses: number;
  totalPayments: number;
  totalRevenue: number;
  totalEnrollments: number;
};

export type AdminRevenue = { date: string; revenue: number };

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
};

export type AdminCourse = {
  id: number;
  title: string;
  teacherName: string;
  price: number;
  published: boolean;
  lectureCount: number;
  createdAt: string;
};

export type AdminPayment = {
  id: number;
  orderId: string;
  userId: number;
  amount: number;
  status: string;
  courseIds: string;
  createdAt: string;
  refundedAt: string | null;
};

export type AdminReview = {
  id: number;
  userName: string;
  courseTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type AdminQna = {
  id: number;
  authorName: string;
  courseTitle: string;
  title: string;
  answerCount: number;
  createdAt: string;
};

// 통계
export const getAdminStats = async (): Promise<AdminStats> =>
  (await api.get("/admin/stats")).data;

export const getAdminRevenue = async (): Promise<AdminRevenue[]> =>
  (await api.get("/admin/stats/revenue")).data;

// 회원
export const getAdminUsers = async (): Promise<AdminUser[]> =>
  (await api.get("/admin/users")).data;

export const changeUserRole = async (userId: number, role: string): Promise<AdminUser> =>
  (await api.patch(`/admin/users/${userId}/role`, { role })).data;

export const toggleUserActive = async (userId: number): Promise<AdminUser> =>
  (await api.patch(`/admin/users/${userId}/active`)).data;

// 강좌
export const getAdminCourses = async (): Promise<AdminCourse[]> =>
  (await api.get("/admin/courses")).data;

export const adminUnpublishCourse = async (courseId: number): Promise<void> =>
  api.delete(`/admin/courses/${courseId}/publish`);

export const adminDeleteCourse = async (courseId: number): Promise<void> =>
  api.delete(`/admin/courses/${courseId}`);

// 결제
export const getAdminPayments = async (): Promise<AdminPayment[]> =>
  (await api.get("/admin/payments")).data;

export const adminRefundPayment = async (paymentId: number): Promise<void> =>
  api.post(`/admin/payments/${paymentId}/refund`);

// 리뷰
export const getAdminReviews = async (): Promise<AdminReview[]> =>
  (await api.get("/admin/reviews")).data;

export const adminDeleteReview = async (reviewId: number): Promise<void> =>
  api.delete(`/admin/reviews/${reviewId}`);

// Q&A
export const getAdminQuestions = async (): Promise<AdminQna[]> =>
  (await api.get("/admin/questions")).data;

export const adminDeleteQuestion = async (questionId: number): Promise<void> =>
  api.delete(`/admin/questions/${questionId}`);

export const adminDeleteAnswer = async (answerId: number): Promise<void> =>
  api.delete(`/admin/answers/${answerId}`);

// 이메일
export const sendBroadcastEmail = async (subject: string, content: string, target: string): Promise<void> =>
  api.post("/admin/email/broadcast", { subject, content, target });

// 강사 신청
export type TeacherApplication = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  phone: string;
  introduction: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
};

export const getTeacherApplications = async (): Promise<TeacherApplication[]> =>
  (await api.get("/admin/teacher-applications")).data;

export const approveTeacherApplication = async (id: number): Promise<void> =>
  api.post(`/admin/teacher-applications/${id}/approve`);

export const rejectTeacherApplication = async (id: number, reason?: string): Promise<void> =>
  api.post(`/admin/teacher-applications/${id}/reject`, { reason });
