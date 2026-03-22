import { BrowserRouter, Routes, Route } from "react-router-dom";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-600">DevClass</h1>
            {/* TODO: 로그인 구현 후 로그인/로그아웃 버튼 추가 */}
          </div>
        </header>

        {/* 페이지 */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<CourseListPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
