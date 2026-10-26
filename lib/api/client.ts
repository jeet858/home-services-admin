import { clearSession, getToken } from "@/lib/auth";
import type { Pagination } from "@/types/api";

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: unknown[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiResult<T> {
  data: T;
  pagination?: Pagination;
  message?: string;
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query) {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

// The backend mixes three envelopes:
//   A: { status: "success", data, pagination? }
//   B: { success: true, message, data: { ..., pagination? } }
//   C: bare objects (OTP auth only)
// Errors arrive as { status: "fail" | "error", message } or { success: false, message }.
function normalize<T>(body: any): ApiResult<T> {
  if (body && typeof body === "object" && ("status" in body || "success" in body)) {
    const data = body.data ?? null;
    const pagination = body.pagination ?? (data && typeof data === "object" ? data.pagination : undefined);
    return { data, pagination, message: body.message };
  }
  return { data: body };
}

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", query, body, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), { method, headers, body: payload, signal });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Rate limiter and 404s can return plain text.
  }

  const failed = !res.ok || json?.success === false || json?.status === "fail" || json?.status === "error";
  if (failed) {
    const message =
      json?.message ||
      (res.status === 429 ? "Too many requests — please wait a moment and try again." : text) ||
      `Request failed (${res.status})`;
    if (res.status === 401 && token && typeof window !== "undefined") {
      clearSession();
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace(`/login?next=${next}`);
    }
    throw new ApiError(res.status, message, json?.errors);
  }

  return normalize<T>(json);
}

export function errorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
