

// lib/api.ts
import { IS_DEV, API_BASE_DEV, API_BASE_PROD, BACKEND_PREFIX } from './config';
// lib/api.ts
export const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isDev = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
    return isDev
      ? process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:8005"
      : process.env.NEXT_PUBLIC_API_URL_PROD || "https://server.stream-lineai.com";
  }
  return process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:8005"
    : process.env.NEXT_PUBLIC_API_URL_PROD || "https://server.stream-lineai.com";
};
