"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarXIcon, CopyIcon, EyeIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import { BookingStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { formatCurrency, formatDate, formatPhone, formatRelative, shortId } from "@/lib/format";
import type { Booking, Pagination } from "@/types/api";

const columns: ColumnDef<Booking>[] = [
  {
    id: "booking",
    header: "Booking",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link href={`/bookings/${row.original.id}`} className="font-mono text-xs font-medium hover:underline">
          {shortId(row.original.id)}
        </Link>
        <span className="text-xs text-muted-foreground">{formatRelative(row.original.createdAt)}</span>
      </div>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{user?.name || "Unnamed"}</span>
          <span className="text-xs text-muted-foreground">{formatPhone(user?.phoneNumber)}</span>
        </div>
      );
    },
  },
  {
    id: "services",
    header: "Services",
    cell: ({ row }) => {
      const { services, subservices } = row.original;
      return (
        <div className="flex max-w-56 flex-col">
          <span className="truncate font-medium">{services.map((s) => s.name).join(", ") || "—"}</span>
          {subservices.length > 0 && (
            <span className="truncate text-xs text-muted-foreground">{subservices.map((s) => s.name).join(", ")}</span>
          )}
        </div>
      );
    },
  },
  {
    id: "schedule",
    header: "Schedule",
    cell: ({ row }) => (
      <div className="flex flex-col whitespace-nowrap">
        <span className="font-medium">{formatDate(row.original.date, "EEE, d MMM")}</span>
        <span className="text-xs text-muted-foreground">{row.original.time}</span>
      </div>
    ),
  },
  {
    id: "provider",
    header: "Professional",
    cell: ({ row }) =>
      row.original.serviceProvider ? (
        <span className="truncate">{row.original.serviceProvider.name}</span>
      ) : (
        <Badge variant="outline" className="border-dashed text-muted-foreground">
          Unassigned
        </Badge>
      ),
  },
  {
    id: "amount",
    header: () => <span className="block text-right">Amount</span>,
    cell: ({ row }) => (
      <div className="flex flex-col items-end gap-1">
        <span className="font-semibold tabular-nums">{formatCurrency(row.original.finalPrice)}</span>
        <PaymentBadge status={row.original.paymentStatus} />
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    size: 48,
    cell: ({ row }) => <RowActions booking={row.original} />,
  },
];

function RowActions({ booking }: { booking: Booking }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Booking actions">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/bookings/${booking.id}`}>
            <EyeIcon />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            navigator.clipboard.writeText(booking.id);
            toast.success("Booking ID copied");
          }}
        >
          <CopyIcon />
          Copy booking ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileBookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{booking.services.map((s) => s.name).join(", ") || "Service"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {booking.user?.name || "Unnamed"} · {formatPhone(booking.user?.phoneNumber)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {formatDate(booking.date, "EEE, d MMM")} · {booking.time}
        </span>
        <span className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(booking.finalPrice)}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-mono text-muted-foreground">{shortId(booking.id)}</span>
        {booking.serviceProvider ? (
          <span className="truncate">{booking.serviceProvider.name}</span>
        ) : (
          <Badge variant="outline" className="border-dashed text-muted-foreground">
            Unassigned
          </Badge>
        )}
      </div>
    </div>
  );
}

export function BookingsTable({
  data,
  loading,
  fetching,
  pagination,
  onPageChange,
  hideCustomer,
}: {
  data: Booking[] | undefined;
  loading?: boolean;
  fetching?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  hideCustomer?: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={hideCustomer ? columns.filter((c) => c.id !== "customer") : columns}
      data={data}
      loading={loading}
      fetching={fetching}
      pagination={pagination}
      onPageChange={onPageChange}
      getRowId={(b) => b.id}
      onRowClick={(b) => router.push(`/bookings/${b.id}`)}
      mobileCard={(b) => <MobileBookingCard booking={b} />}
      empty={<EmptyState icon={CalendarXIcon} title="No bookings found" description="Try changing the filters or date range." />}
    />
  );
}
