import { lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";

const CourseListPage     = lazy(() => import("./pages/CourseListPage"));
const CourseDetailPage   = lazy(() => import("./pages/CourseDetailPage"));
const MyEnrollmentsPage  = lazy(() => import("./pages/MyEnrollmentsPage"));
const LoginPage          = lazy(() => import("./pages/LoginPage"));
const SignupPage         = lazy(() => import("./pages/SignupPage"));
const WatchPage          = lazy(() => import("./pages/WatchPage"));
const TeacherDashboardPage = lazy(() => import("./pages/TeacherDashboardPage"));
const StudentListPage    = lazy(() => import("./pages/StudentListPage"));
const ProfilePage        = lazy(() => import("./pages/ProfilePage"));
const CourseEditPage     = lazy(() => import("./pages/CourseEditPage"));
const CartPage           = lazy(() => import("./pages/CartPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentFailPage    = lazy(() => import("./pages/PaymentFailPage"));
const MyPaymentsPage     = lazy(() => import("./pages/MyPaymentsPage"));

function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === "TEACHER") return <Navigate to="/teacher" replace />;
  return <CourseListPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const { count } = useCart();

  const navItem = (path: string, label: string) => {
    const active = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`text-sm font-medium transition-colors ${
          active ? "text-white" : "text-zinc-400 hover:text-white"
        }`}
      >
        {label}
      </button>
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-white text-sm font-black">D</span>
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            Dev<span className="text-orange-500">Class</span>
          </span>
        </button>

        <nav className="flex items-center gap-8">
          {navItem("/", "강의")}
          {user?.role === "TEACHER"
            ? navItem("/teacher", "대시보드")
            : navItem("/my", "내 강의")}
          {user?.role === "STUDENT" && (
            <>
              {navItem("/my/payments", "결제 내역")}
              <button
                onClick={() => navigate("/cart")}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/cart"
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                장바구니
                {count > 0 && (
                  <span className="ml-2 text-[10px] font-black text-black bg-orange-400 rounded-full px-1.5 py-0.5">
                    {count}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-xs text-zinc-500 font-medium hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
              >
                로그인
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg transition-colors"
              >
                시작하기
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<div className="flex justify-center items-center h-64 text-red-400">오류가 발생했습니다.</div>}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-zinc-950 text-white">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-10">
              <Suspense fallback={<div className="flex justify-center items-center h-64 text-zinc-400">로딩 중...</div>}>
              <Routes>
                <Route path="/" element={<HomeRoute />} />
                <Route
                  path="/courses/:courseId"
                  element={<CourseDetailPage />}
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/my"
                  element={
                    <ProtectedRoute>
                      <MyEnrollmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/payment/fail" element={<PaymentFailPage />} />
                <Route
                  path="/my/payments"
                  element={
                    <ProtectedRoute>
                      <MyPaymentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:courseId/watch"
                  element={<WatchPage />}
                />
                <Route
                  path="/teacher"
                  element={
                    <ProtectedRoute>
                      <TeacherDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/courses/new"
                  element={
                    <ProtectedRoute>
                      <CourseEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/courses/:courseId/edit"
                  element={
                    <ProtectedRoute>
                      <CourseEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/courses/:courseId/students"
                  element={
                    <ProtectedRoute>
                      <StudentListPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              </Suspense>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
