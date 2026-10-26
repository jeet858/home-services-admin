"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, Rating, RatingStatus } from "@/types/api";

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (status: RatingStatus, page: number) => ["reviews", "list", status, page] as const,
};

export function useReviews(status: RatingStatus, page: number, limit = 10) {
  return useQuery({
    queryKey: reviewKeys.list(status, page),
    queryFn: async ({ signal }): Promise<Paginated<Rating>> => {
      const res = await api<{ ratings: Rating[] }>("/api/ratings/all", { query: { status, page, limit }, signal });
      return { items: res.data.ratings, pagination: res.pagination ?? { total: 0, page, limit, totalPages: 1 } };
    },
    placeholderData: keepPreviousData,
  });
}

export function useReviewRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reviewNote }: { id: string; status: "approved" | "rejected"; reviewNote?: string }) =>
      api(`/api/ratings/${id}/review`, { method: "PUT", body: { status, reviewNote: reviewNote || undefined } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}
