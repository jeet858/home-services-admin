"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, ProviderStats, ProviderStatus, ServiceProvider } from "@/types/api";

export interface ProviderFilters {
  page?: number;
  limit?: number;
  status?: ProviderStatus;
  service?: string;
  verificationStatus?: "verified" | "pending";
  search?: string;
}

export const providerKeys = {
  all: ["providers"] as const,
  list: (filters: ProviderFilters) => ["providers", "list", filters] as const,
  options: () => ["providers", "options"] as const,
  detail: (id: string) => ["providers", "detail", id] as const,
  stats: (id: string) => ["providers", "stats", id] as const,
};

export function useProviders(filters: ProviderFilters) {
  return useQuery({
    queryKey: providerKeys.list(filters),
    queryFn: async ({ signal }): Promise<Paginated<ServiceProvider>> => {
      const res = await api<{ serviceProviders: ServiceProvider[] }>("/api/service-providers", { query: { ...filters }, signal });
      return {
        items: res.data.serviceProviders,
        pagination: res.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    },
    placeholderData: keepPreviousData,
  });
}

// Every provider, sorted by rating — used by the assign picker.
export function useProviderOptions(enabled = true) {
  return useQuery({
    queryKey: providerKeys.options(),
    queryFn: async ({ signal }) =>
      (await api<{ serviceProviders: ServiceProvider[] }>("/api/service-providers/available", { method: "POST", body: {}, signal }))
        .data.serviceProviders,
    enabled,
    staleTime: 60_000,
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: providerKeys.detail(id),
    queryFn: async ({ signal }) =>
      (await api<{ serviceProvider: ServiceProvider }>(`/api/service-providers/${id}`, { signal })).data.serviceProvider,
  });
}

export function useProviderStats(id: string) {
  return useQuery({
    queryKey: providerKeys.stats(id),
    queryFn: async ({ signal }) => (await api<ProviderStats>(`/api/service-providers/${id}/stats`, { signal })).data,
  });
}

function useProviderMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: providerKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCreateProvider() {
  return useProviderMutation(async (body: FormData) =>
    (await api<{ serviceProvider: ServiceProvider }>("/api/service-providers", { method: "POST", body })).data.serviceProvider,
  );
}

export function useUpdateProvider() {
  return useProviderMutation(async ({ id, body }: { id: string; body: FormData }) =>
    (await api<{ serviceProvider: ServiceProvider }>(`/api/service-providers/${id}`, { method: "PUT", body })).data
      .serviceProvider,
  );
}

export function useDeleteProvider() {
  return useProviderMutation((id: string) => api(`/api/service-providers/${id}`, { method: "DELETE" }));
}

export function useVerifyDocument() {
  return useProviderMutation(
    ({ id, documentType, verified }: { id: string; documentType: "aadhaarCard" | "panCard"; verified: boolean }) =>
      api(`/api/service-providers/${id}/verify-documents`, { method: "PUT", body: { documentType, verified } }),
  );
}

export function useVerifyProvider() {
  return useProviderMutation(({ id, notes }: { id: string; notes?: string }) =>
    api(`/api/service-providers/${id}/verify`, {
      method: "PUT",
      body: { notes, verifyDocuments: { aadhaarCard: true, panCard: true } },
    }),
  );
}

export function useSuspendProvider() {
  return useProviderMutation(({ id, reason }: { id: string; reason?: string }) =>
    api(`/api/service-providers/${id}/suspend`, { method: "PUT", body: { reason } }),
  );
}

// Status changes other than suspend go through the general update endpoint.
export function useSetProviderStatus() {
  return useProviderMutation(({ id, status }: { id: string; status: ProviderStatus }) => {
    const body = new FormData();
    body.append("status", status);
    return api(`/api/service-providers/${id}`, { method: "PUT", body });
  });
}
