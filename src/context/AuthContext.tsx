"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type User = {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function readStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("derby_token");
}

function authHeaders(token: string | null): HeadersInit {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveToken = useCallback(
    () => token ?? readStoredToken(),
    [token],
  );

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const activeToken = resolveToken();
      const headers = new Headers(options.headers);
      if (activeToken) headers.set("Authorization", `Bearer ${activeToken}`);
      if (!headers.has("Content-Type") && options.body) {
        headers.set("Content-Type", "application/json");
      }
      return fetch(url, { ...options, headers, credentials: "include" });
    },
    [resolveToken],
  );

  const refreshUser = useCallback(async () => {
    const activeToken = resolveToken();
    const res = await fetch("/api/auth/me", {
      credentials: "include",
      headers: authHeaders(activeToken),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  }, [resolveToken]);

  useEffect(() => {
    const stored = readStoredToken();
    if (stored) setToken(stored);

    fetch("/api/auth/me", {
      credentials: "include",
      headers: authHeaders(stored),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setToken(data.token);
    localStorage.setItem("derby_token", data.token);
    setUser(data.user);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setToken(data.token);
    localStorage.setItem("derby_token", data.token);
    setUser(data.user);
  };

  const logout = async () => {
    const activeToken = resolveToken();
    await fetch("/api/auth/me", {
      method: "DELETE",
      credentials: "include",
      headers: authHeaders(activeToken),
    });
    localStorage.removeItem("derby_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
