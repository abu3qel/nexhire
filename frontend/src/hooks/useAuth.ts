"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { saveAuth, getStoredUser, clearAuth, getToken } from "@/lib/auth";
import { authApi } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && getToken()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    saveAuth(data.access_token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    company_name?: string;
  }) => {
    const { data } = await authApi.register(payload);
    saveAuth(data.access_token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, loading, login, register, logout };
}
