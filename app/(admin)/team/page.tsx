"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, PencilIcon, ShieldCheckIcon, Trash2Icon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/data-table/data-table";
import { useCurrentAdmin } from "@/components/layout/user-nav";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PersonAvatar } from "@/components/shared/misc";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useAdmins, useCreateAdmin, useDeleteAdmin, useUpdateAdmin } from "@/features/team/api";
import { formatDate, formatPhone, formatRelative } from "@/lib/format";
import type { User } from "@/types/api";

const createSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email("Enter a valid email"),
  phoneNumber: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit mobile number"),
  password: z.string().min(8, "At least 8 characters"),
});
const editSchema = createSchema.pick({ name: true, email: true });

type CreateValues = z.infer<typeof createSchema>;

export default function TeamPage() {
  const [page, setPage] = useState(1);
  const me = useCurrentAdmin();
  const { data, isLoading, isFetching, error, refetch } = useAdmins(page);
  const remove = useDeleteAdmin();
  const [dialog, setDialog] = useState<{ mode: "create" } | { mode: "edit"; admin: User } | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      header: "Admin",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <PersonAvatar name={row.original.name} src={row.original.avatar} className="size-9" />
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2 truncate font-medium">
              {row.original.name || "Unnamed"}
              {row.original.id === me?.id && <Badge variant="secondary">You</Badge>}
            </span>
            <span className="truncate text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    { id: "phone", header: "Phone", cell: ({ row }) => formatPhone(row.original.phoneNumber) },
    {
      id: "lastLogin",
      header: "Last sign-in",
      cell: ({ row }) => (row.original.lastLogin ? formatRelative(row.original.lastLogin) : "Never"),
    },
    { id: "created", header: "Added", cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: "actions",
      size: 48,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Admin actions">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDialog({ mode: "edit", admin: row.original })}>
              <PencilIcon /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" disabled={row.original.id === me?.id} onSelect={() => setDeleting(row.original)}>
              <Trash2Icon /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Team"
        description="People who can sign in to this admin console."
        actions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <UserPlusIcon data-icon="inline-start" />
            Add admin
          </Button>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items}
          loading={isLoading}
          fetching={isFetching && !isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          getRowId={(u) => u.id}
          mobileCard={(u) => (
            <div className="flex items-center gap-3">
              <PersonAvatar name={u.name} className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setDialog({ mode: "edit", admin: u })} aria-label="Edit">
                <PencilIcon />
              </Button>
            </div>
          )}
          empty={<EmptyState icon={ShieldCheckIcon} title="No admins" />}
        />
      )}

      <AdminDialog state={dialog} onClose={() => setDialog(null)} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Remove ${deleting?.name ?? "admin"}?`}
        description="They will no longer be able to sign in to the admin console."
        confirmLabel="Remove"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Admin removed");
              setDeleting(null);
            },
          })
        }
      />
    </PageContainer>
  );
}

function AdminDialog({
  state,
  onClose,
}: {
  state: { mode: "create" } | { mode: "edit"; admin: User } | null;
  onClose: () => void;
}) {
  const isEdit = state?.mode === "edit";
  const create = useCreateAdmin();
  const update = useUpdateAdmin();
  const form = useForm<CreateValues>({
    resolver: zodResolver(isEdit ? (editSchema as unknown as typeof createSchema) : createSchema),
    defaultValues: { name: "", email: "", phoneNumber: "", password: "" },
  });

  useEffect(() => {
    if (!state) return;
    form.reset(
      state.mode === "edit"
        ? { name: state.admin.name ?? "", email: state.admin.email ?? "", phoneNumber: "", password: "" }
        : { name: "", email: "", phoneNumber: "", password: "" },
    );
  }, [state, form]);

  const pending = create.isPending || update.isPending;

  const onSubmit = (values: CreateValues) => {
    if (state?.mode === "edit") {
      update.mutate(
        { id: state.admin.id, name: values.name, email: values.email },
        {
          onSuccess: () => {
            toast.success("Admin updated");
            onClose();
          },
        },
      );
    } else {
      create.mutate(values, {
        onSuccess: () => {
          toast.success(`${values.name} can now sign in`);
          onClose();
        },
      });
    }
  };

  const fields: { name: keyof CreateValues; label: string; type?: string; createOnly?: boolean }[] = [
    { name: "name", label: "Name" },
    { name: "email", label: "Email", type: "email" },
    { name: "phoneNumber", label: "Mobile number", createOnly: true },
    { name: "password", label: "Temporary password", type: "password", createOnly: true },
  ];

  return (
    <Dialog open={state !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit admin" : "Add admin"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update name and email." : "They can sign in right away with this email and password."}
          </DialogDescription>
        </DialogHeader>
        <form id="admin-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {fields
              .filter((f) => !(isEdit && f.createOnly))
              .map((f) => (
                <Controller
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`admin-${f.name}`}>{f.label}</FieldLabel>
                      <Input
                        {...field}
                        id={`admin-${f.name}`}
                        type={f.type ?? "text"}
                        autoComplete={f.type === "password" ? "new-password" : "off"}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              ))}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="admin-form" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {isEdit ? "Save" : "Add admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
