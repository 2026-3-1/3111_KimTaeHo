import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - JWT 토큰 자동 추가
// TODO: 로그인 구현 후 localStorage에서 토큰 꺼내서 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "오류가 발생했습니다.";
    console.error("API Error:", message);
    return Promise.reject(error);
  },
);

export default api;
