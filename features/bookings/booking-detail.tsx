"use client";

import {
  BanIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  CopyIcon,
  ExternalLinkIcon,
  KeyRoundIcon,
  MailIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  PlayIcon,
  StarIcon,
  Trash2Icon,
  UserCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PersonAvatar } from "@/components/shared/misc";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { BOOKING_STATUS, BookingStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { DetailSkeleton, ErrorState } from "@/components/shared/states";
import { SAFETY_FEE, formatAddress, formatCurrency, formatDate, formatDateTime, formatPhone, shortId } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/api";
import { useBooking, useDeleteBooking, useUpdateBookingStatus } from "./api";
import { AssignProviderPicker } from "./assign-provider";
import { EditBookingSheet } from "./edit-booking-sheet";
import { StartServiceDialog } from "./start-service-dialog";

export function BookingDetail({ id }: { id: string }) {
  const { data: booking, isLoading, error, refetch } = useBooking(id);

  if (isLoading) {
    return (
      <PageContainer>
        <DetailSkeleton />
      </PageContainer>
    );
  }
  if (error || !booking) {
    return (
      <PageContainer>
        <ErrorState error={error ?? new Error("Booking not found")} onRetry={() => refetch()} />
      </PageContainer>
    );
  }
  return <BookingView booking={booking} />;
}

function BookingView({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [statusTarget, setStatusTarget] = useState<BookingStatus | null>(null);
  const [reason, setReason] = useState("");
  const [startOpen, setStartOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateStatus = useUpdateBookingStatus();
  const remove = useDeleteBooking();

  const open = booking.status === "pending" || booking.status === "confirmed";
  const canStart = open && !booking.startedAt;
  const nextStatuses = (["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).filter((s) => s !== booking.status);

  const confirmStatus = () => {
    if (!statusTarget) return;
    updateStatus.mutate(
      { id: booking.id, status: statusTarget, reason: statusTarget === "cancelled" ? reason.trim() || undefined : undefined },
      {
        onSuccess: () => {
          toast.success(`Marked as ${BOOKING_STATUS[statusTarget].label.toLowerCase()}`);
          setStatusTarget(null);
          setReason("");
        },
      },
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            Booking <span className="font-mono text-xl">{shortId(booking.id)}</span>
            <BookingStatusBadge status={booking.status} />
          </span>
        }
        description={`Placed ${formatDateTime(booking.createdAt)}`}
        actions={
          <>
            {canStart && (
              <Button variant="outline" onClick={() => setStartOpen(true)}>
                <PlayIcon data-icon="inline-start" />
                Start service
              </Button>
            )}
            {booking.status === "confirmed" && booking.startedAt && (
              <Button onClick={() => setStatusTarget("completed")}>
                <CheckCircle2Icon data-icon="inline-start" />
                Mark completed
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Change status</DropdownMenuLabel>
                {nextStatuses.map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => setStatusTarget(s)}>
                    <CircleDotIcon />
                    {BOOKING_STATUS[s].label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <PencilIcon />
                  Edit booking
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
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                  <Trash2Icon />
                  Delete booking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {booking.status === "cancelled" && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive-soft/60 p-4 text-sm">
          <BanIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Cancelled {booking.cancelledAt ? formatDateTime(booking.cancelledAt) : ""}</p>
            <p className="text-muted-foreground">{booking.cancellationReason || "No reason given."}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Service</CardTitle>
              <CardDescription>
                {formatDate(booking.date, "EEEE, d MMMM yyyy")} · {booking.time}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {booking.services.map((s) => (
                  <Link
                    key={s.id}
                    href={`/services/${s.id}`}
                    className="rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-foreground hover:underline"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
              <ul className="flex flex-col divide-y rounded-xl border">
                {booking.subservices.map((s) => (
                  <li key={s.id} className="flex flex-col gap-0.5 px-4 py-3">
                    <span className="font-medium">{s.name}</span>
                    {s.description && <span className="line-clamp-2 text-xs text-muted-foreground">{s.description}</span>}
                  </li>
                ))}
                {booking.subservices.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No line items</li>}
              </ul>
              {booking.notes && (
                <div className="rounded-xl bg-muted/60 p-3 text-sm">
                  <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Notes</p>
                  <p className="whitespace-pre-wrap">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline booking={booking} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
                {booking.user && (
                  <CardAction>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/customers/${booking.userId}`}>Profile</Link>
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <PersonAvatar name={booking.user?.name} className="size-10" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{booking.user?.name || "Unnamed customer"}</p>
                    <p className="text-xs text-muted-foreground">Customer since signup</p>
                  </div>
                </div>
                {booking.user?.phoneNumber && (
                  <a href={`tel:${booking.user.phoneNumber}`} className="flex items-center gap-2 hover:text-primary">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    {formatPhone(booking.user.phoneNumber)}
                  </a>
                )}
                {booking.user?.email && (
                  <a href={`mailto:${booking.user.email}`} className="flex items-center gap-2 truncate hover:text-primary">
                    <MailIcon className="size-4 text-muted-foreground" />
                    {booking.user.email}
                  </a>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
                {booking.address?.lat != null && booking.address?.lng != null && (
                  <CardAction>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${booking.address.lat},${booking.address.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Map <ExternalLinkIcon data-icon="inline-end" />
                      </a>
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent className="text-sm">
                {booking.address ? (
                  <div className="flex gap-2">
                    <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                      {booking.address.label && <span className="font-medium">{booking.address.label}</span>}
                      <span>{formatAddress(booking.address)}</span>
                      {booking.address.landmark && booking.address.fullAddress && (
                        <span className="text-xs text-muted-foreground">Near {booking.address.landmark}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No address on file</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              {booking.assignedAt && (
                <CardDescription>
                  Assigned {formatDateTime(booking.assignedAt)}
                  {booking.assignedBy?.name ? ` by ${booking.assignedBy.name}` : ""}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {booking.serviceProvider ? (
                <Link
                  href={`/providers/${booking.serviceProvider.id}`}
                  className="-m-2 flex items-center gap-3 rounded-lg p-2 hover:bg-accent/60"
                >
                  <PersonAvatar name={booking.serviceProvider.name} className="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{booking.serviceProvider.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPhone(booking.serviceProvider.phoneNumber)}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                    <StarIcon className="size-3.5 fill-warning text-warning" />
                    {booking.serviceProvider.ratingAverage ? booking.serviceProvider.ratingAverage.toFixed(1) : "New"}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                  <UserCheckIcon className="size-4" />
                  No professional assigned yet
                </div>
              )}
              {open && <AssignProviderPicker booking={booking} className="w-full" />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardAction>
                <PaymentBadge status={booking.paymentStatus} />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <BillRow label="Items" value={formatCurrency(booking.finalPrice + booking.discount - SAFETY_FEE)} />
              {booking.discount > 0 && (
                <BillRow
                  label={`Discount${booking.couponCode ? ` (${booking.couponCode})` : ""}`}
                  value={`−${formatCurrency(booking.discount)}`}
                  className="text-success"
                />
              )}
              <BillRow label="Safety & support fee" value={formatCurrency(SAFETY_FEE)} />
              <Separator className="my-1" />
              <BillRow label="Total" value={formatCurrency(booking.finalPrice)} className="text-base font-semibold" />
              {booking.tip > 0 && <BillRow label="Tip for professional" value={formatCurrency(booking.tip)} />}
              <Separator className="my-1" />
              <BillRow label="Method" value={booking.paymentMethod === "online" ? "Online (Razorpay)" : "Cash / UPI after service"} />
              {booking.razorpayPaymentId && <BillRow label="Payment ID" value={<code className="text-xs">{booking.razorpayPaymentId}</code>} />}
              {booking.razorpayOrderId && <BillRow label="Order ID" value={<code className="text-xs">{booking.razorpayOrderId}</code>} />}
            </CardContent>
          </Card>

          {booking.serviceOtp && open && (
            <Card size="sm">
              <CardContent className="flex items-center gap-3">
                <KeyRoundIcon className="size-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Service OTP</p>
                  <p className="text-xs text-muted-foreground">The customer shares this with the professional on arrival.</p>
                </div>
                <span className="font-mono text-lg font-semibold tracking-[0.3em]">{booking.serviceOtp}</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={statusTarget !== null}
        onOpenChange={(o) => !o && setStatusTarget(null)}
        title={statusTarget ? `Mark as ${BOOKING_STATUS[statusTarget].label.toLowerCase()}?` : ""}
        description={
          statusTarget === "completed"
            ? "This records the job as finished. Cash bookings are marked paid."
            : statusTarget === "cancelled"
              ? "The customer will see this booking as cancelled."
              : "The booking status will be updated."
        }
        confirmLabel={statusTarget === "cancelled" ? "Cancel booking" : "Update status"}
        destructive={statusTarget === "cancelled"}
        pending={updateStatus.isPending}
        onConfirm={confirmStatus}
      >
        {statusTarget === "cancelled" && (
          <Field>
            <FieldLabel htmlFor="cancel-reason">Reason</FieldLabel>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. No professional available in the area"
            />
            <FieldDescription>Saved on the booking for reference.</FieldDescription>
          </Field>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this booking?"
        description="This permanently removes the booking and its ratings. Prefer cancelling unless this was created by mistake."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(booking.id, {
            onSuccess: () => {
              toast.success("Booking deleted");
              router.replace("/bookings");
            },
          })
        }
      />

      <StartServiceDialog bookingId={booking.id} open={startOpen} onOpenChange={setStartOpen} />
      <EditBookingSheet booking={booking} open={editOpen} onOpenChange={setEditOpen} />
    </PageContainer>
  );
}

function BillRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

// Same steps the customer sees on the app's live tracking screen.
function Timeline({ booking }: { booking: Booking }) {
  let steps: { label: string; at: string | null; hint?: string }[] = [
    { label: "Booking placed", at: booking.createdAt },
    { label: "Professional assigned", at: booking.assignedAt },
    { label: "Service started", at: booking.startedAt, hint: "After OTP check" },
    { label: "Completed", at: booking.completedAt },
  ];
  if (booking.status === "cancelled") {
    steps = [...steps.filter((s) => s.at), { label: "Cancelled", at: booking.cancelledAt ?? booking.createdAt }];
  }
  const current = steps.findIndex((s) => !s.at);

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const done = Boolean(step.at);
        const cancelled = step.label === "Cancelled";
        return (
          <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span className={cn("absolute top-6 left-[11px] h-[calc(100%-1.25rem)] w-0.5", done ? "bg-primary" : "bg-border")} />
            )}
            <span
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                cancelled
                  ? "border-destructive bg-destructive text-white"
                  : done
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === current
                      ? "border-primary bg-background"
                      : "border-border bg-background",
              )}
            >
              {done && (cancelled ? <BanIcon className="size-3" /> : <CheckCircle2Icon className="size-3.5" />)}
            </span>
            <div className="flex flex-1 flex-col pt-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <span className={cn("text-sm font-medium", !done && "text-muted-foreground")}>{step.label}</span>
              <span className="text-xs text-muted-foreground">{step.at ? formatDateTime(step.at) : step.hint ?? "Pending"}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
