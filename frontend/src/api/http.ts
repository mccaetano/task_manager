import type {
  LoginRequest,
  Page,
  RegisterRequest,
  Task,
  TaskRequest,
  TokenResponse,
  User,
  UserUpdateRequest
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_KEY = "task_manager_token";
const TOKEN_EXPIRY_KEY = "task_manager_token_expires_at";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function getStoredToken() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiresAt = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token) {
    return null;
  }

  if (expiresAt && Number.isFinite(Date.parse(expiresAt)) && Date.parse(expiresAt) <= Date.now()) {
    clearStoredToken();
    return null;
  }

  return token;
}

export function storeToken(response: TokenResponse) {
  sessionStorage.setItem(TOKEN_KEY, response.accessToken);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, response.expiresAt);
}

export function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getStoredToken();

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new ApiError("Nao foi possivel conectar ao servidor.", 0);
  }

  const body = await readBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new Event("auth:expired"));
    }

    throw new ApiError(readErrorMessage(body, response.status), response.status, body);
  }

  return body as T;
}

async function readBody(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function readErrorMessage(body: unknown, status: number) {
  if (typeof body === "string" && body.trim()) {
    return body;
  }

  if (body && typeof body === "object") {
    const objectBody = body as Record<string, unknown>;
    if (typeof objectBody.message === "string") return objectBody.message;
    if (typeof objectBody.error === "string") return objectBody.error;
    if (Array.isArray(objectBody.errors) && objectBody.errors.length > 0) {
      return objectBody.errors.join(", ");
    }
  }

  if (status === 401) return "Sessao expirada ou credenciais invalidas.";
  if (status === 409) return "Este e-mail ja esta cadastrado.";
  if (status === 400) return "Revise os campos e tente novamente.";
  return "Algo saiu do esperado. Tente novamente.";
}

export const api = {
  login: (payload: LoginRequest) =>
    request<TokenResponse>("/api/auth/login", {
      auth: false,
      method: "POST",
      body: JSON.stringify(payload)
    }),
  register: (payload: RegisterRequest) =>
    request<User>("/api/auth/register", {
      auth: false,
      method: "POST",
      body: JSON.stringify(payload)
    }),
  currentUser: () => request<User>("/api/users"),
  updateUser: (id: string, payload: UserUpdateRequest) =>
    request<User>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  listTasks: (page = 0, size = 50) =>
    request<Page<Task>>(`/api/tasks?page=${page}&size=${size}&sort=duedate,asc`),
  getTask: (id: string) => request<Task>(`/api/tasks/${id}`),
  createTask: (payload: TaskRequest) =>
    request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateTask: (id: string, payload: TaskRequest) =>
    request<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteTask: (id: string) =>
    request<void>(`/api/tasks/${id}`, {
      method: "DELETE"
    })
};
