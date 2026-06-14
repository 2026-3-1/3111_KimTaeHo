import api from "./axios";

export type PaymentOrderResponse = {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
};

export type PaymentConfirmResponse = {
  enrolledCount: number;
  enrolledCourseIds: number[];
};

export type CourseRefundInfo = {
  courseId: number;
  courseTitle: string;
  progress: number;
};

export type PaymentHistory = {
  orderId: string;
  amount: number;
  status: "PAID" | "REFUNDED" | "PENDING" | "FAILED";
  createdAt: string;
  refundedAt: string | null;
  courses: CourseRefundInfo[];
  refundEligible: boolean;
};

export const createPaymentOrder = async (
  userId: number,
): Promise<PaymentOrderResponse> => {
  const { data } = await api.post("/payments/orders", null, {
    params: { userId },
  });
  return data;
};

export const confirmPayment = async (params: {
  paymentKey: string;
  orderId: string;
  amount: number;
  userId: number;
}): Promise<PaymentConfirmResponse> => {
  const { data } = await api.post("/payments/confirm", params);
  return data;
};

export const getMyPayments = async (userId: number): Promise<PaymentHistory[]> => {
  const { data } = await api.get("/payments/my", { params: { userId } });
  return data;
};

export const refundPayment = async (orderId: string, userId: number): Promise<void> => {
  await api.post(`/payments/${orderId}/refund`, null, { params: { userId } });
};
