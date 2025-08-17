// lib/config.ts
export const IS_DEV = process.env.NODE_ENV !== "production";

export const API_BASE_DEV =
  process.env.NEXT_PUBLIC_API_URL_DEV ?? "http://localhost:8005";

export const API_BASE_PROD =
  process.env.NEXT_PUBLIC_API_URL_PROD ?? "https://server.stream-lineai.com";

// If your FastAPI routes are like /auth, /customers keep this ""
// If they are /api/auth, /api/customers set it to "/api"
export const BACKEND_PREFIX =
  (process.env.NEXT_PUBLIC_BACKEND_PREFIX ?? "").replace(/\/+$/, "");

export const API_BASE = IS_DEV ? API_BASE_DEV : API_BASE_PROD;