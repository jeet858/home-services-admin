import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus, PaymentStatus, ProviderStatus, RatingStatus } from "@/types/api";

type Tone = "primary" | "warning" | "success" | "danger" | "neutral";

const toneClass: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  success: "bg-success-soft text-success-soft-foreground",
  danger: "bg-destructive-soft text-destructive dark:text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

const dotClass: Record<Tone, string> = {
  primary: "bg-primary",
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-destructive",
  neutral: "bg-muted-foreground/60",
};

export function ToneBadge({ tone, label, className }: { tone: Tone; label: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("gap-1.5 border-transparent font-medium", toneClass[tone], className)}>
      <span className={cn("size-1.5 rounded-full", dotClass[tone])} aria-hidden />
      {label}
    </Badge>
  );
}

// Labels and colours match the mobile app's booking cards.
export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  pending: { label: "Booked", tone: "primary" },
  confirmed: { label: "Confirmed", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const PROVIDER_STATUS: Record<ProviderStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  verification_pending: { label: "Verification pending", tone: "warning" },
  pending: { label: "Pending", tone: "primary" },
  inactive: { label: "Inactive", tone: "neutral" },
  suspended: { label: "Suspended", tone: "danger" },
};

export const RATING_STATUS: Record<RatingStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = BOOKING_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <ToneBadge {...s} />;
}

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  const s = PROVIDER_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <ToneBadge {...s} />;
}

export function RatingStatusBadge({ status }: { status: RatingStatus }) {
  const s = RATING_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <ToneBadge {...s} />;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return status === "paid" ? <ToneBadge tone="success" label="Paid" /> : <ToneBadge tone="neutral" label="Unpaid" />;
}
