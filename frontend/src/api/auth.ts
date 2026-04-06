// ====================================================
// TODO: 백엔드 인증 구현 완료 후 아래 Mock 코드 전체를
//       실제 API 호출로 교체할 것
//
// 실제 구현 시 대체 코드:
//   export const signup = async (body) => (await api.post("/auth/signup", body)).data;
//   export const login  = async (body) => (await api.post("/auth/login",  body)).data;
// ====================================================

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

// --- Mock 내부 구현 ---

type MockUser = {
  id: number;
  email: string;
  password: string;
  role: string;
};

const STORAGE_KEY = "devclass_mock_users";

function getMockUsers(): MockUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveMockUsers(users: MockUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/** parseJwt(token)으로 디코딩 가능한 가짜 JWT 생성 */
function buildMockToken(id: number, email: string, role: string): string {
  const header = btoa('{"alg":"none"}');
  const payload = btoa(JSON.stringify({ id, email, role }));
  return `${header}.${payload}.mock`;
}

// --- 공개 API ---

export const signup = async (body: SignupRequest): Promise<SignupResponse> => {
  const users = getMockUsers();

  if (users.find((u) => u.email === body.email)) {
    const err: any = new Error("이미 사용 중인 이메일");
    err.response = { status: 409 };
    throw err;
  }

  const newUser: MockUser = {
    id: users.length + 1,
    email: body.email,
    password: body.password,
    role: body.role,
  };
  saveMockUsers([...users, newUser]);

  return {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    createdAt: new Date().toISOString().split("T")[0],
  };
};

export const login = async (body: LoginRequest): Promise<LoginResponse> => {
  const users = getMockUsers();
  const user = users.find(
    (u) => u.email === body.email && u.password === body.password,
  );

  if (!user) {
    const err: any = new Error("인증 실패");
    err.response = { status: 401 };
    throw err;
  }

  return {
    accessToken: buildMockToken(user.id, user.email, user.role),
    tokenType: "Bearer",
  };
};
