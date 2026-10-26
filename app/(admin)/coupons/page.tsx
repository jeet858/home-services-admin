"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CopyIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, TicketPercentIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { ToneBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useCoupons, useDeleteCoupon, useUpdateCoupon } from "@/features/coupons/api";
import { CouponSheet } from "@/features/coupons/coupon-sheet";
import { useUrlState } from "@/hooks/use-url-state";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Coupon } from "@/types/api";

const isExpired = (c: Coupon) => Boolean(c.validTill && new Date(c.validTill) < new Date());

function describeValue(c: Coupon) {
  const base = c.type === "percent" ? `${c.value}% off` : c.type === "flat" ? `${formatCurrency(c.value)} off` : `${formatCurrency(c.value)} cashback`;
  const extras = [c.maxDiscount != null && `up to ${formatCurrency(c.maxDiscount)}`, c.minOrder > 0 && `min ${formatCurrency(c.minOrder)}`].filter(Boolean);
  return { base, extras: extras.join(" · ") };
}

function CouponStatus({ c }: { c: Coupon }) {
  if (isExpired(c)) return <ToneBadge tone="neutral" label="Expired" />;
  return c.active ? <ToneBadge tone="success" label="Live" /> : <ToneBadge tone="warning" label="Paused" />;
}

export default function CouponsPage() {
  const { get, set } = useUrlState();
  const { data, isLoading, error, refetch } = useCoupons();
  const update = useUpdateCoupon();
  const remove = useDeleteCoupon();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [filter, setFilter] = useState("all");

  // Deep link from the command menu: /coupons?new=1
  useEffect(() => {
    if (get("new")) {
      setEditing(null);
      setSheetOpen(true);
      set({ new: undefined });
    }
  }, [get, set]);

  const rows = useMemo(() => {
    const list = data ?? [];
    if (filter === "live") return list.filter((c) => c.active && !isExpired(c));
    if (filter === "inactive") return list.filter((c) => !c.active || isExpired(c));
    return list;
  }, [data, filter]);

  const openEditor = (c: Coupon | null) => {
    setEditing(c);
    setSheetOpen(true);
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      id: "code",
      header: "Coupon",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <code className="rounded-md border border-dashed border-primary/40 bg-primary-soft/50 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary-soft-foreground">
              {row.original.code}
            </code>
            {row.original.tag && <Badge variant="outline">{row.original.tag}</Badge>}
          </span>
          <span className="max-w-72 truncate text-xs text-muted-foreground">{row.original.title}</span>
        </div>
      ),
    },
    {
      id: "value",
      header: "Offer",
      cell: ({ row }) => {
        const { base, extras } = describeValue(row.original);
        return (
          <div className="flex flex-col">
            <span className="font-medium">{base}</span>
            {extras && <span className="text-xs text-muted-foreground">{extras}</span>}
          </div>
        );
      },
    },
    {
      id: "limit",
      header: "Per customer",
      cell: ({ row }) => (row.original.perUserLimit ? `${row.original.perUserLimit}×` : "Unlimited"),
    },
    {
      id: "validTill",
      header: "Valid till",
      cell: ({ row }) => (row.original.validTill ? formatDate(row.original.validTill) : <span className="text-muted-foreground">No expiry</span>),
    },
    { id: "status", header: "Status", cell: ({ row }) => <CouponStatus c={row.original} /> },
    {
      id: "active",
      header: "Active",
      size: 64,
      cell: ({ row }) => (
        <Switch
          checked={row.original.active}
          aria-label={`Toggle ${row.original.code}`}
          onCheckedChange={(active) =>
            update.mutate(
              { id: row.original.id, active },
              { onSuccess: () => toast.success(`${row.original.code} ${active ? "activated" : "paused"}`) },
            )
          }
        />
      ),
    },
    {
      id: "actions",
      size: 48,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Coupon actions">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openEditor(row.original)}>
              <PencilIcon /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                navigator.clipboard.writeText(row.original.code);
                toast.success("Code copied");
              }}
            >
              <CopyIcon /> Copy code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(row.original)}>
              <Trash2Icon /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Coupons"
        description="Discount codes customers can apply at checkout."
        actions={
          <Button onClick={() => openEditor(null)}>
            <PlusIcon data-icon="inline-start" />
            New coupon
          </Button>
        }
      />
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList variant="line">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="inactive">Paused & expired</TabsTrigger>
        </TabsList>
      </Tabs>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          getRowId={(c) => c.id}
          onRowClick={openEditor}
          mobileCard={(c) => {
            const { base, extras } = describeValue(c);
            return (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-sm font-semibold text-primary">{c.code}</code>
                  <CouponStatus c={c} />
                </div>
                <p className="text-sm">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {base}
                  {extras ? ` · ${extras}` : ""}
                  {c.validTill ? ` · till ${formatDate(c.validTill, "d MMM")}` : ""}
                </p>
              </div>
            );
          }}
          empty={
            <EmptyState
              icon={TicketPercentIcon}
              title="No coupons"
              description="Create a coupon to run an offer in the app."
              action={<Button onClick={() => openEditor(null)}>New coupon</Button>}
            />
          }
        />
      )}
      <CouponSheet coupon={editing} open={sheetOpen} onOpenChange={setSheetOpen} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.code}?`}
        description="Customers won't be able to use it any more. Consider pausing it instead."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Coupon deleted");
              setDeleting(null);
            },
          })
        }
      />
    </PageContainer>
  );
}
