"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, User } from "@/types/api";

export const teamKeys = {
  all: ["team"] as const,
  list: (page: number) => ["team", "list", page] as const,
};

export function useAdmins(page: number, limit = 20) {
  return useQuery({
    queryKey: teamKeys.list(page),
    queryFn: async ({ signal }): Promise<Paginated<User>> => {
      const res = await api<{ admins: User[] }>("/api/admin/admins", { query: { page, limit }, signal });
      return { items: res.data.admins, pagination: res.pagination ?? { total: 0, page, limit, totalPages: 1 } };
    },
    placeholderData: keepPreviousData,
  });
}

function useTeamMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }) });
}

export function useCreateAdmin() {
  return useTeamMutation((body: { name: string; email: string; password: string; phoneNumber: string }) =>
    api("/api/admin/admins", { method: "POST", body }),
  );
}

export function useUpdateAdmin() {
  return useTeamMutation(({ id, ...body }: { id: string; name: string; email: string }) =>
    api(`/api/admin/admins/${id}`, { method: "PUT", body }),
  );
}

export function useDeleteAdmin() {
  return useTeamMutation((id: string) => api(`/api/admin/admins/${id}`, { method: "DELETE" }));
}
