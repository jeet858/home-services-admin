"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, User } from "@/types/api";

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const customerKeys = {
  all: ["customers"] as const,
  list: (filters: CustomerFilters) => ["customers", "list", filters] as const,
  detail: (id: string) => ["customers", "detail", id] as const,
};

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: async ({ signal }): Promise<Paginated<User>> => {
      const res = await api<{ users: User[] }>("/api/admin/users", { query: { ...filters }, signal });
      return { items: res.data.users, pagination: res.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 } };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async ({ signal }) => (await api<{ user: User }>(`/api/admin/users/${id}`, { signal })).data.user,
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; email?: string }) =>
      api(`/api/admin/users/${id}`, { method: "PUT", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
