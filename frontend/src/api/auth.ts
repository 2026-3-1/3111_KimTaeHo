import api from "./axios";

export type SignupRequest = {
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER";
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupResponse = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
};

export const signup = async (body: SignupRequest): Promise<SignupResponse> => {
  const { data } = await api.post("/auth/signup", body);
  return data;
};

export const login = async (body: LoginRequest): Promise<LoginResponse> => {
  const { data } = await api.post("/auth/login", body);
  return data;
};
