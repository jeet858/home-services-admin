"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { HardHatIcon, PlusIcon, ShieldCheckIcon, ShieldQuestionIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { SearchInput, TableToolbar } from "@/components/data-table/toolbar";
import { PersonAvatar, Stars } from "@/components/shared/misc";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { ProviderStatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useProviders } from "@/features/providers/api";
import { useServices } from "@/features/services/api";
import { useUrlState } from "@/hooks/use-url-state";
import { formatPhone } from "@/lib/format";
import type { ProviderStatus, ServiceProvider } from "@/types/api";

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "verification_pending", label: "Awaiting verification" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

function KycStatus({ p }: { p: ServiceProvider }) {
  const verified = p.aadhaarCard?.verified && p.panCard?.verified;
  return verified ? (
    <span className="flex items-center gap-1.5 text-xs text-success">
      <ShieldCheckIcon className="size-4" /> Verified
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ShieldQuestionIcon className="size-4" />
      {[p.aadhaarCard?.verified && "Aadhaar", p.panCard?.verified && "PAN"].filter(Boolean).join(" · ") || "Not verified"}
    </span>
  );
}

const columns: ColumnDef<ServiceProvider>[] = [
  {
    id: "name",
    header: "Professional",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <PersonAvatar name={row.original.name} src={row.original.passportPhoto} className="size-9" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{formatPhone(row.original.phoneNumber)}</span>
        </div>
      </div>
    ),
  },
  {
    id: "services",
    header: "Services",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-56 text-sm">{row.original.services.map((s) => s.name).join(", ") || "—"}</span>
    ),
  },
  {
    id: "experience",
    header: "Experience",
    cell: ({ row }) =>
      row.original.experience ? (
        <span className="whitespace-nowrap">
          {row.original.experience} {row.original.experienceUnit}
        </span>
      ) : (
        "—"
      ),
  },
  {
    id: "rating",
    header: "Rating",
    cell: ({ row }) =>
      row.original.rating?.totalRatings ? (
        <div className="flex flex-col gap-0.5">
          <Stars value={row.original.rating.average} />
          <span className="text-xs text-muted-foreground">
            {row.original.rating.average.toFixed(1)} · {row.original.rating.totalRatings} reviews
          </span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">No ratings</span>
      ),
  },
  { id: "kyc", header: "KYC", cell: ({ row }) => <KycStatus p={row.original} /> },
  { id: "status", header: "Status", cell: ({ row }) => <ProviderStatusBadge status={row.original.status} /> },
];

export default function ProvidersPage() {
  const router = useRouter();
  const { get, set, page } = useUrlState();
  const status = get("status") as ProviderStatus | undefined;
  const service = get("service");
  const search = get("search");
  const { data: services } = useServices();
  const { data, isLoading, isFetching, error, refetch } = useProviders({ page, limit: 15, status, service, search });

  return (
    <PageContainer>
      <PageHeader
        title="Professionals"
        description="Service providers who carry out bookings."
        actions={
          <Button asChild>
            <Link href="/providers/new">
              <PlusIcon data-icon="inline-start" />
              Add professional
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-3">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Tabs value={status ?? "all"} onValueChange={(v) => set({ status: v === "all" ? undefined : v })}>
            <TabsList variant="line">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <TableToolbar>
          <SearchInput value={search} onChange={(v) => set({ search: v })} placeholder="Name, phone, email, Aadhaar, PAN" />
          <Select value={service ?? "all"} onValueChange={(v) => set({ service: v === "all" ? undefined : v })}>
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
        </TableToolbar>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items}
          loading={isLoading}
          fetching={isFetching && !isLoading}
          pagination={data?.pagination}
          onPageChange={(p) => set({ page: p }, { resetPage: false })}
          getRowId={(p) => p.id}
          onRowClick={(p) => router.push(`/providers/${p.id}`)}
          mobileCard={(p) => (
            <div className="flex items-center gap-3">
              <PersonAvatar name={p.name} src={p.passportPhoto} className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.services.map((s) => s.name).join(", ") || "No services"}</p>
                <KycStatus p={p} />
              </div>
              <ProviderStatusBadge status={p.status} />
            </div>
          )}
          empty={
            <EmptyState
              icon={HardHatIcon}
              title="No professionals found"
              description={search || status || service ? "Try clearing the filters." : "Add your first service professional."}
            />
          }
        />
      )}
    </PageContainer>
  );
}
