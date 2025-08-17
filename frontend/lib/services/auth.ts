// lib/services/auth.ts
import { api, http } from "@/lib/https";

// If you want the cookie set on backend domain specifically, call direct (no proxy)
export const login = (email: string, password: string) =>
  http<{ token: string; user: any }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    useProxy: false, // call backend domain directly
  });

export const verify = () =>
  api.get<{ valid: boolean; user?: any }>("/auth/verify");

export const logout = () =>
  api.post<{ message: string }>("/auth/logout");
