// src/pages/StudentListPage.tsx (임시)
import { useNavigate } from "react-router-dom";

export default function StudentListPage() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20">
      <p className="text-zinc-500">준비 중입니다.</p>
      <button
        onClick={() => navigate("/teacher")}
        className="mt-4 text-sm text-orange-500"
      >
        ← 대시보드로
      </button>
    </div>
  );
}
