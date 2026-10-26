"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchInput, TableToolbar } from "@/components/data-table/toolbar";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";
import { useBookings } from "@/features/bookings/api";
import { BookingsTable } from "@/features/bookings/bookings-table";
import { useUrlState } from "@/hooks/use-url-state";
import type { BookingStatus, PaymentStatus } from "@/types/api";

const TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Booked" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const { get, set, page } = useUrlState();
  const status = get("status") as BookingStatus | undefined;
  const paymentStatus = get("payment") as PaymentStatus | undefined;
  const unassigned = get("unassigned") === "true";
  const search = get("search");
  const from = get("from");
  const to = get("to");

  const { data, isLoading, isFetching, error, refetch } = useBookings({
    page,
    limit: 15,
    status,
    paymentStatus,
    unassigned,
    search,
    from,
    to,
  });

  return (
    <PageContainer>
      <PageHeader title="Bookings" description="Every booking made through the Subidha app." />

      <div className="flex flex-col gap-3">
        <Tabs value={status ?? "all"} onValueChange={(v) => set({ status: v === "all" ? undefined : v })}>
          <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <TabsList variant="line">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        <TableToolbar>
          <SearchInput value={search} onChange={(v) => set({ search: v })} placeholder="Customer name, phone or booking ID" />
          <DateRangeFilter from={from} to={to} onChange={(r) => set({ from: r.from, to: r.to })} placeholder="Service date" />
          <Select value={paymentStatus ?? "any"} onValueChange={(v) => set({ payment: v === "any" ? undefined : v })}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Unpaid</SelectItem>
            </SelectContent>
          </Select>
          <Label className="flex h-8 items-center gap-2 rounded-lg border px-3 font-normal">
            <Switch checked={unassigned} onCheckedChange={(v) => set({ unassigned: v ? "true" : undefined })} size="sm" />
            Unassigned only
          </Label>
        </TableToolbar>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <BookingsTable
          data={data?.items}
          loading={isLoading}
          fetching={isFetching && !isLoading}
          pagination={data?.pagination}
          onPageChange={(p) => set({ page: p }, { resetPage: false })}
        />
      )}
    </PageContainer>
  );
}
