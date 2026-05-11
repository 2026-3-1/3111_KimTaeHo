import api from "./axios";

export type CartItem = {
  cartItemId: number;
  courseId: number;
  title: string;
  price: number;
  category: string;
  level: string;
  averageRating: number;
  teacherName: string;
  addedAt: string;
  alreadyEnrolled: boolean;
};

export type CartCheckoutResult = {
  requestedCount: number;
  successCount: number;
  failedCount: number;
  enrolledCourseIds: number[];
  failedCourseIds: number[];
};

export const getCart = async (userId: number): Promise<CartItem[]> => {
  const { data } = await api.get("/cart", { params: { userId } });
  return data;
};

export const addCartItem = async (
  userId: number,
  courseId: number,
): Promise<CartItem> => {
  const { data } = await api.post("/cart/items", { userId, courseId });
  return data;
};

export const removeCartItem = async (
  userId: number,
  courseId: number,
): Promise<void> => {
  await api.delete(`/cart/items/${courseId}`, { params: { userId } });
};

export const clearCartItems = async (userId: number): Promise<void> => {
  await api.delete("/cart", { params: { userId } });
};

export const checkoutCart = async (
  userId: number,
): Promise<CartCheckoutResult> => {
  const { data } = await api.post("/cart/checkout", null, {
    params: { userId },
  });
  return data;
};
