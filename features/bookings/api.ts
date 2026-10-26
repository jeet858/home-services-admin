"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Booking, BookingStatus, Paginated, PaymentStatus } from "@/types/api";

export interface BookingFilters {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  from?: string;
  to?: string;
  unassigned?: boolean;
  userId?: string;
  providerId?: string;
  search?: string;
}

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (filters: BookingFilters) => ["bookings", "list", filters] as const,
  detail: (id: string) => ["bookings", "detail", id] as const,
};

export function useBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: async ({ signal }): Promise<Paginated<Booking>> => {
      const res = await api<{ bookings: Booking[] }>("/api/booking", {
        query: { ...filters, unassigned: filters.unassigned ? "true" : undefined },
        signal,
      });
      return {
        items: res.data.bookings,
        pagination: res.pagination ?? { total: res.data.bookings.length, page: 1, limit: res.data.bookings.length, totalPages: 1 },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async ({ signal }) => (await api<{ booking: Booking }>(`/api/booking/${id}`, { signal })).data.booking,
  });
}

function useBookingMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBookingStatus() {
  return useBookingMutation(({ id, status, reason }: { id: string; status: BookingStatus; reason?: string }) =>
    api(`/api/booking/${id}/status`, { method: "PATCH", body: { status, reason } }),
  );
}

export function useStartBooking() {
  return useBookingMutation(({ id, otp }: { id: string; otp: string }) =>
    api(`/api/booking/${id}/start`, { method: "PATCH", body: { otp } }),
  );
}

export function useAssignProvider() {
  return useBookingMutation(({ id, providerId }: { id: string; providerId: string }) =>
    api(`/api/booking/${id}/assign-provider`, { method: "PUT", body: { providerId } }),
  );
}

export interface BookingEdit {
  date?: string;
  time?: string;
  discount?: number;
  finalPrice?: number;
  notes?: string;
}

export function useUpdateBooking() {
  return useBookingMutation(({ id, ...body }: BookingEdit & { id: string }) =>
    api(`/api/booking/my-bookings/${id}`, { method: "PUT", body }),
  );
}

export function useDeleteBooking() {
  return useBookingMutation((id: string) => api(`/api/booking/my-bookings/${id}`, { method: "DELETE" }));
}
