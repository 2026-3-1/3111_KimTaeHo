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
