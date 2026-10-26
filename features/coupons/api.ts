"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Coupon, CouponType } from "@/types/api";

export const couponKeys = { all: ["coupons"] as const };

export function useCoupons() {
  return useQuery({
    queryKey: couponKeys.all,
    queryFn: async ({ signal }) => (await api<{ coupons: Coupon[] }>("/api/coupons/admin/all", { signal })).data.coupons,
  });
}

export interface CouponInput {
  code: string;
  title: string;
  type: CouponType;
  value: number;
  description?: string | null;
  tag?: string | null;
  maxDiscount?: number | null;
  minOrder?: number;
  validTill?: string | null;
  perUserLimit?: number | null;
  active?: boolean;
}

function useCouponMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: couponKeys.all }) });
}

export function useCreateCoupon() {
  return useCouponMutation((body: CouponInput) => api("/api/coupons", { method: "POST", body }));
}

export function useUpdateCoupon() {
  return useCouponMutation(({ id, ...body }: Partial<CouponInput> & { id: string }) =>
    api(`/api/coupons/${id}`, { method: "PUT", body }),
  );
}

export function useDeleteCoupon() {
  return useCouponMutation((id: string) => api(`/api/coupons/${id}`, { method: "DELETE" }));
}
