"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ListTreeIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { SearchInput, TableToolbar } from "@/components/data-table/toolbar";
import { Thumb } from "@/components/shared/image-preview";
import { Price } from "@/components/shared/misc";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useServices, useSubservices } from "@/features/services/api";
import { useUrlState } from "@/hooks/use-url-state";
import type { Subservice } from "@/types/api";

const columns: ColumnDef<Subservice>[] = [
  {
    id: "name",
    header: "Sub-service",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Thumb src={row.original.image} alt={row.original.name} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{row.original.name}</span>
          {row.original.description && (
            <span className="line-clamp-1 max-w-80 text-xs text-muted-foreground">{row.original.description}</span>
          )}
        </div>
      </div>
    ),
  },
  {
    id: "service",
    header: "Service",
    cell: ({ row }) => <Badge variant="secondary">{row.original.service?.name ?? "—"}</Badge>,
  },
  { id: "duration", header: "Duration", cell: ({ row }) => <span className="whitespace-nowrap">{row.original.duration}</span> },
  {
    id: "price",
    header: () => <span className="block text-right">Price</span>,
    cell: ({ row }) => (
      <div className="text-right">
        <Price original={row.original.originalPrice} discounted={row.original.discountedPrice} />
      </div>
    ),
  },
];

export default function SubservicesPage() {
  const router = useRouter();
  const { get, set } = useUrlState();
  const search = get("search");
  const serviceId = get("service");
  const { data: services } = useServices();
  const { data, isLoading, error, refetch } = useSubservices();

  const rows = useMemo(() => {
    const term = search?.toLowerCase();
    return (data ?? []).filter(
      (s) => (!serviceId || s.serviceId === serviceId) && (!term || s.name.toLowerCase().includes(term)),
    );
  }, [data, search, serviceId]);

  return (
    <PageContainer>
      <PageHeader
        title="Sub-services"
        description="The individual items customers add to their cart."
        actions={
          <Button asChild>
            <Link href={serviceId ? `/sub-services/new?serviceId=${serviceId}` : "/sub-services/new"}>
              <PlusIcon data-icon="inline-start" />
              New sub-service
            </Link>
          </Button>
        }
      />
      <TableToolbar>
        <SearchInput value={search} onChange={(v) => set({ search: v })} placeholder="Search sub-services" />
        <Select value={serviceId ?? "all"} onValueChange={(v) => set({ service: v === "all" ? undefined : v })}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {(services ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isLoading && <span className="text-sm text-muted-foreground sm:ml-auto">{rows.length} items</span>}
      </TableToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading}
          getRowId={(s) => s.id}
          onRowClick={(s) => router.push(`/sub-services/${s.id}`)}
          mobileCard={(s) => (
            <div className="flex items-center gap-3">
              <Thumb src={s.image} alt={s.name} className="size-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.service?.name ?? "—"} · {s.duration}
                </p>
              </div>
              <Price original={s.originalPrice} discounted={s.discountedPrice} />
            </div>
          )}
          empty={
            <EmptyState
              icon={ListTreeIcon}
              title="No sub-services found"
              description={search || serviceId ? "Try clearing the filters." : "Add items customers can book."}
            />
          }
        />
      )}
    </PageContainer>
  );
}
