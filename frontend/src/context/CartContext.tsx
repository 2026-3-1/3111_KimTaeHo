import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  addCartItem,
  checkoutCart,
  clearCartItems,
  getCart,
  removeCartItem,
  type CartCheckoutResult,
  type CartItem,
} from "../api/cart";

type CartContextType = {
  items: CartItem[];
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  isInCart: (courseId: number) => boolean;
  addToCart: (
    courseId: number,
  ) => Promise<{ added: boolean; message?: string }>;
  removeFromCart: (courseId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<CartCheckoutResult>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isLoggedIn || !user || user.role !== "STUDENT") {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const cart = await getCart(user.id);
      setItems(cart);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  const isInCart = useCallback(
    (courseId: number) => items.some((item) => item.courseId === courseId),
    [items],
  );

  const addToCart = useCallback(
    async (courseId: number) => {
      if (!isLoggedIn || user?.role === "TEACHER") {
        return {
          added: false,
          message: "학생 로그인 후 장바구니를 이용할 수 있습니다.",
        };
      }
      try {
        const addedItem = await addCartItem(user!.id, courseId);
        setItems((prev) => [addedItem, ...prev]);
        return { added: true };
      } catch (e: any) {
        return {
          added: false,
          message: e.response?.data?.message || "장바구니 담기에 실패했습니다.",
        };
      }
    },
    [isLoggedIn, user],
  );

  const removeFromCart = useCallback(
    async (courseId: number) => {
      if (!isLoggedIn || !user || user.role !== "STUDENT") return;
      await removeCartItem(user.id, courseId);
      setItems((prev) => prev.filter((item) => item.courseId !== courseId));
    },
    [isLoggedIn, user],
  );

  const clearCart = useCallback(async () => {
    if (!isLoggedIn || !user || user.role !== "STUDENT") return;
    await clearCartItems(user.id);
    setItems([]);
  }, [isLoggedIn, user]);

  const checkout = useCallback(async (): Promise<CartCheckoutResult> => {
    if (!isLoggedIn || !user || user.role !== "STUDENT") {
      return {
        requestedCount: 0,
        successCount: 0,
        failedCount: 0,
        enrolledCourseIds: [],
        failedCourseIds: [],
      };
    }
    const result = await checkoutCart(user.id);
    await refresh();
    return result;
  }, [isLoggedIn, refresh, user]);

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.length,
        loading,
        refresh,
        isInCart,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
