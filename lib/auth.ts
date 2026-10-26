import type { User } from "@/types/api";

// Read by middleware.ts too, so keep the name in sync.
export const TOKEN_COOKIE = "subidha_admin_token";
const PROFILE_KEY = "subidha_admin_profile";
const MAX_AGE = 60 * 60 * 24 * 30;

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(TOKEN_COOKIE.length + 1)) : null;
}

export function setSession(token: string, admin: User) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(admin));
  } catch {}
}

export function clearSession() {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {}
}

export function getProfile(): User | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// The admin JWT carries { id, role, email }; used as a fallback when no profile is stored.
export function getTokenClaims(): { id?: string; email?: string } {
  const token = getToken();
  if (!token) return {};
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}
