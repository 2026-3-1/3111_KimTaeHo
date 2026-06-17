import axios from "axios";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function forceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - JWT 토큰 자동 추가 + 만료 사전 감지
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    if (isTokenExpired(token)) {
      forceLogout();
      return Promise.reject(new Error("Token expired"));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "오류가 발생했습니다.";

    // 로그인 요청 외 401은 서버 측 세션 무효화 → 강제 로그아웃
    if (status === 401 && !error.config?.url?.includes("/auth/login")) {
      forceLogout();
      return Promise.reject(error);
    }

    console.error("API Error:", message);
    return Promise.reject(error);
  },
);

export default api;
