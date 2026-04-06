import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import MyEnrollmentsPage from "./pages/MyEnrollmentsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WatchPage from "./pages/WatchPage";

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
          {navItem("/my", "내 강의")}
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
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-zinc-950 text-white">
          <Header />
          <main className="max-w-6xl mx-auto px-6 py-10">
            <Routes>
              <Route path="/" element={<CourseListPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
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
              <Route path="/courses/:courseId/watch" element={<WatchPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
