"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type Row } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Pagination } from "@/types/api";

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[] | undefined;
  loading?: boolean;
  fetching?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  // Rendered instead of the table below the md breakpoint.
  mobileCard?: (row: T) => React.ReactNode;
  empty?: React.ReactNode;
  getRowId?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  fetching,
  pagination,
  onPageChange,
  onRowClick,
  mobileCard,
  empty,
  getRowId,
}: DataTableProps<T>) {
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  });

  const rows = table.getRowModel().rows;
  const showEmpty = !loading && rows.length === 0;

  const clickable = (row: Row<T>) =>
    onRowClick
      ? {
          role: "link" as const,
          tabIndex: 0,
          onClick: (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest("button, a, [role=menuitem], input, label")) return;
            onRowClick(row.original);
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && e.target === e.currentTarget) onRowClick(row.original);
          },
        }
      : {};

  return (
    <div className="flex flex-col gap-3">
      {showEmpty ? (
        empty
      ) : (
        <>
          {mobileCard && (
            <div className={cn("flex flex-col gap-2 md:hidden", fetching && "opacity-60 transition-opacity")}>
              {loading
                ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                : rows.map((row) => (
                    <div
                      key={row.id}
                      {...clickable(row)}
                      className={cn("rounded-xl border bg-card p-4 text-sm", onRowClick && "cursor-pointer active:bg-accent/50")}
                    >
                      {mobileCard(row.original)}
                    </div>
                  ))}
            </div>
          )}
          <div
            className={cn(
              "overflow-hidden rounded-xl border bg-card",
              mobileCard && "hidden md:block",
              fetching && "opacity-60 transition-opacity",
            )}
          >
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id} className="hover:bg-transparent">
                    {group.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-10 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase"
                        style={{ width: header.column.columnDef.size !== 150 ? header.column.columnDef.size : undefined }}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 6 }, (_, i) => (
                      <TableRow key={i}>
                        {columns.map((_, j) => (
                          <TableCell key={j} className="px-4 py-3">
                            <Skeleton className="h-5 w-full max-w-40" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : rows.map((row) => (
                      <TableRow key={row.id} {...clickable(row)} className={cn(onRowClick && "cursor-pointer")}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      {pagination && onPageChange && pagination.total > 0 && (
        <TablePagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}

export function TablePagination({ pagination, onPageChange }: { pagination: Pagination; onPageChange: (page: number) => void }) {
  const { page, limit, total, totalPages } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <span className="tabular-nums">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <span className="hidden tabular-nums sm:inline">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
