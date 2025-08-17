// lib/config.ts
const ensureProto = (base: string) => {
  const trimmed = (base || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
};

export const IS_DEV = process.env.NODE_ENV !== 'production';

const RAW_API_BASE_DEV =
  process.env.NEXT_PUBLIC_API_URL_DEV ?? 'http://localhost:8005';

const RAW_API_BASE_PROD =
  process.env.NEXT_PUBLIC_API_URL_PROD ?? 'https://server.stream-lineai.com';

export const API_BASE_DEV = ensureProto(RAW_API_BASE_DEV).replace(/\/+$/, '');
export const API_BASE_PROD = ensureProto(RAW_API_BASE_PROD).replace(/\/+$/, '');

export const BACKEND_PREFIX =
  (process.env.NEXT_PUBLIC_BACKEND_PREFIX ?? '').replace(/\/+$/, '');

export const API_BASE = IS_DEV ? API_BASE_DEV : API_BASE_PROD;
