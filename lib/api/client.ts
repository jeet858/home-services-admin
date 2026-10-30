import axios, { type AxiosResponse } from "axios";
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

export const http = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
  // Keep raw text so plain-text bodies (rate limiter, 404s) survive; we parse JSON ourselves.
  responseType: "text",
  transformResponse: [(data) => data],
  // Envelope errors can arrive with 2xx, so all failure handling lives in api().
  validateStatus: () => true,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function cleanQuery(query?: Query) {
  if (!query) return undefined;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params[key] = String(value);
  }
  return params;
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
  const hadToken = Boolean(getToken());

  let res: AxiosResponse<string>;
  try {
    res = await http.request<string>({
      url: path,
      method,
      params: cleanQuery(query),
      // axios serializes objects as JSON and sends FormData as multipart.
      data: body,
      signal,
    });
  } catch (error) {
    if (axios.isCancel(error)) throw new DOMException("Request aborted", "AbortError");
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  const text = res.data ?? "";
  const ok = res.status >= 200 && res.status < 300;
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Rate limiter and 404s can return plain text.
  }

  const failed = !ok || json?.success === false || json?.status === "fail" || json?.status === "error";
  if (failed) {
    const message =
      json?.message ||
      (res.status === 429 ? "Too many requests — please wait a moment and try again." : text) ||
      `Request failed (${res.status})`;
    if (res.status === 401 && hadToken && typeof window !== "undefined") {
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
