let tokenGetter: () => string | null = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token"); // or your AuthContext can override
};

export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

export function getAuthToken(): string | null {
  try {
    return tokenGetter();
  } catch {
    return null;
  }
}