"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { DashboardStats } from "@/types/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async ({ signal }) => (await api<DashboardStats>("/api/admin/stats", { signal })).data,
    staleTime: 60_000,
  });
}
