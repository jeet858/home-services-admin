"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon, PhoneIcon, Trash2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DescriptionList, PersonAvatar } from "@/components/shared/misc";
import { PageContainer } from "@/components/shared/page-header";
import { DetailSkeleton, ErrorState } from "@/components/shared/states";
import { useBookings } from "@/features/bookings/api";
import { BookingsTable } from "@/features/bookings/bookings-table";
import { useCustomer, useDeleteCustomer, useUpdateCustomer } from "@/features/customers/api";
import { formatDate, formatDateTime, formatPhone } from "@/lib/format";
import type { User } from "@/types/api";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
});

export default function CustomerPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, error, refetch } = useCustomer(id);

  return (
    <PageContainer>
      {isLoading ? (
        <DetailSkeleton />
      ) : error || !user ? (
        <ErrorState error={error ?? new Error("Customer not found")} onRetry={() => refetch()} />
      ) : (
        <CustomerView user={user} />
      )}
    </PageContainer>
  );
}

function CustomerView({ user }: { user: User }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const bookings = useBookings({ userId: user.id, page, limit: 10 });
  const update = useUpdateCustomer();
  const remove = useDeleteCustomer();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name ?? "", email: user.email ?? "" },
  });

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <PersonAvatar name={user.name} src={user.avatar} className="size-16 text-lg" />
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{user.name || "Unnamed customer"}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <a href={`tel:${user.phoneNumber}`} className="flex items-center gap-1.5 hover:text-primary">
              <PhoneIcon className="size-3.5" /> {formatPhone(user.phoneNumber)}
            </a>
            {user.email && (
              <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 hover:text-primary">
                <MailIcon className="size-3.5" /> {user.email}
              </a>
            )}
          </div>
        </div>
        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
          <Trash2Icon data-icon="inline-start" />
          Delete customer
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold">
            Bookings {bookings.data ? <span className="text-muted-foreground">({bookings.data.pagination.total})</span> : null}
          </h2>
          <BookingsTable
            data={bookings.data?.items}
            loading={bookings.isLoading}
            fetching={bookings.isFetching && !bookings.isLoading}
            pagination={bookings.data?.pagination}
            onPageChange={setPage}
            hideCustomer
          />
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Phone number is the login and can&apos;t be changed.</CardDescription>
            </CardHeader>
            <form
              onSubmit={form.handleSubmit((values) =>
                update.mutate({ id: user.id, ...values }, { onSuccess: () => toast.success("Customer updated") }),
              )}
            >
              <CardContent>
                <FieldGroup>
                  {(["name", "email"] as const).map((name) => (
                    <Controller
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={name} className="capitalize">
                            {name}
                          </FieldLabel>
                          <Input {...field} id={name} type={name === "email" ? "email" : "text"} aria-invalid={fieldState.invalid} />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  ))}
                </FieldGroup>
              </CardContent>
              <CardFooter className="mt-4 justify-end border-t pt-4">
                <Button type="submit" disabled={update.isPending || !form.formState.isDirty}>
                  {update.isPending && <Spinner data-icon="inline-start" />}
                  Save
                </Button>
              </CardFooter>
            </form>
          </Card>
          <Card>
            <CardContent>
              <DescriptionList
                items={[
                  { label: "Joined", value: formatDate(user.createdAt) },
                  { label: "Last login", value: user.lastLogin ? formatDateTime(user.lastLogin) : "—" },
                  { label: "Customer ID", value: <code className="text-xs break-all">{user.id}</code> },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${user.name || "this customer"}?`}
        description="This permanently deletes their account along with all their addresses, bookings and ratings."
        confirmLabel="Delete permanently"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(user.id, {
            onSuccess: () => {
              toast.success("Customer deleted");
              router.replace("/customers");
            },
          })
        }
      />
    </>
  );
}
