export type TaskStatus = "CREATED" | "OPEN" | "FINISHIED" | "CANCELED";

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
};

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  name: string;
  phone: string;
};

export type Task = {
  id: string;
  title: string;
  updated: string;
  status: TaskStatus;
  duedate: string;
  userId: string;
};

export type TaskRequest = {
  title: string;
  status: TaskStatus;
  duedate: string;
};

export type UserUpdateRequest = {
  email: string;
  name: string;
  phone: string;
  password?: string;
};

export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
};
