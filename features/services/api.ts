"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Service, Subservice } from "@/types/api";

export const serviceKeys = {
  all: ["services"] as const,
  list: () => ["services", "list"] as const,
  detail: (id: string) => ["services", "detail", id] as const,
};

export const subserviceKeys = {
  all: ["subservices"] as const,
  list: () => ["subservices", "list"] as const,
  detail: (id: string) => ["subservices", "detail", id] as const,
};

// The catalogue is small, so fetch it in one page and filter client-side.
const CATALOGUE_LIMIT = 500;

export function useServices() {
  return useQuery({
    queryKey: serviceKeys.list(),
    queryFn: async ({ signal }) =>
      (await api<{ services: Service[] }>("/api/services", { query: { limit: CATALOGUE_LIMIT }, signal })).data.services,
    staleTime: 5 * 60_000,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: async ({ signal }) => (await api<{ service: Service }>(`/api/services/${id}`, { signal })).data.service,
  });
}

export function useSubservices() {
  return useQuery({
    queryKey: subserviceKeys.list(),
    queryFn: async ({ signal }) =>
      (await api<{ subservices: Subservice[] }>("/api/subservice", { query: { limit: CATALOGUE_LIMIT }, signal })).data
        .subservices,
    staleTime: 5 * 60_000,
  });
}

export function useSubservice(id: string) {
  return useQuery({
    queryKey: subserviceKeys.detail(id),
    queryFn: async ({ signal }) =>
      (await api<{ subservice: Subservice }>(`/api/subservice/${id}`, { signal })).data.subservice,
  });
}

export interface CatalogueInput {
  name: string;
  description?: string;
  process?: string;
  originalPrice: number;
  discountedPrice: number;
  duration: string;
  image?: string;
}

function useCatalogueMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
      qc.invalidateQueries({ queryKey: subserviceKeys.all });
    },
  });
}

export function useCreateService() {
  return useCatalogueMutation(async (body: CatalogueInput) =>
    (await api<{ service: Service }>("/api/services", { method: "POST", body })).data.service,
  );
}

export function useUpdateService() {
  return useCatalogueMutation(async ({ id, ...body }: CatalogueInput & { id: string }) =>
    (await api<{ service: Service }>(`/api/services/${id}`, { method: "PUT", body })).data.service,
  );
}

export function useDeleteService() {
  return useCatalogueMutation((id: string) => api(`/api/services/${id}`, { method: "DELETE" }));
}

export function useCreateSubservice() {
  return useCatalogueMutation(async (body: CatalogueInput & { serviceId: string }) =>
    (await api<{ subservice: Subservice }>("/api/subservice", { method: "POST", body })).data.subservice,
  );
}

// The backend ignores image and serviceId on update.
export function useUpdateSubservice() {
  return useCatalogueMutation(async ({ id, image: _image, ...body }: CatalogueInput & { id: string }) =>
    (await api<{ subservice: Subservice }>(`/api/subservice/${id}`, { method: "PUT", body })).data.subservice,
  );
}

// Uploads to Supabase Storage via the backend; returns the public URL to save as `image`.
export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("image", file);
      return (await api<{ url: string; key: string }>("/api/uploads/image", { method: "POST", body })).data.url;
    },
  });
}

export function useDeleteSubservice() {
  return useCatalogueMutation((id: string) => api(`/api/subservice/${id}`, { method: "DELETE" }));
}
