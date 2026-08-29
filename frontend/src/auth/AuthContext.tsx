import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, clearStoredToken, getStoredToken, storeToken } from "../api/http";
import type { LoginRequest, RegisterRequest } from "../api/types";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getStoredToken()));

  const logout = useCallback(() => {
    clearStoredToken();
    setIsAuthenticated(false);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const login = useCallback(async (payload: LoginRequest) => {
    const token = await api.login(payload);
    storeToken(token);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(
    async (payload: RegisterRequest) => {
      await api.register(payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login]
  );

  const value = useMemo(
    () => ({ isAuthenticated, login, register, logout }),
    [isAuthenticated, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
