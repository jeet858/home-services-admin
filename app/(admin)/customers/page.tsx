"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { SearchInput, TableToolbar } from "@/components/data-table/toolbar";
import { PersonAvatar } from "@/components/shared/misc";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useCustomers } from "@/features/customers/api";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDate, formatPhone, formatRelative } from "@/lib/format";
import type { User } from "@/types/api";

const columns: ColumnDef<User>[] = [
  {
    id: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <PersonAvatar name={row.original.name} src={row.original.avatar} className="size-9" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{row.original.name || "Unnamed"}</span>
          <span className="truncate text-xs text-muted-foreground">{row.original.email || "No email"}</span>
        </div>
      </div>
    ),
  },
  { id: "phone", header: "Phone", cell: ({ row }) => <span className="whitespace-nowrap">{formatPhone(row.original.phoneNumber)}</span> },
  { id: "joined", header: "Joined", cell: ({ row }) => formatDate(row.original.createdAt) },
  {
    id: "lastLogin",
    header: "Last active",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.lastLogin ? formatRelative(row.original.lastLogin) : "—"}</span>,
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const { get, set, page } = useUrlState();
  const search = get("search");
  const { data, isLoading, isFetching, error, refetch } = useCustomers({ page, limit: 20, search });

  return (
    <PageContainer>
      <PageHeader
        title="Customers"
        description={data ? `${data.pagination.total.toLocaleString("en-IN")} people have signed up on the app.` : "People using the Subidha app."}
      />
      <TableToolbar>
        <SearchInput value={search} onChange={(v) => set({ search: v })} placeholder="Name, phone or email" />
      </TableToolbar>
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
          getRowId={(u) => u.id}
          onRowClick={(u) => router.push(`/customers/${u.id}`)}
          mobileCard={(u) => (
            <div className="flex items-center gap-3">
              <PersonAvatar name={u.name} src={u.avatar} className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{u.name || "Unnamed"}</p>
                <p className="truncate text-xs text-muted-foreground">{formatPhone(u.phoneNumber)}</p>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(u.createdAt, "d MMM yy")}</span>
            </div>
          )}
          empty={<EmptyState icon={UsersIcon} title="No customers found" description={search ? "Try a different search." : undefined} />}
        />
      )}
    </PageContainer>
  );
}
