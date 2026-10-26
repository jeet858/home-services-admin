"use client";

import { CheckIcon, MessageSquareQuoteIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TablePagination } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PersonAvatar, Stars } from "@/components/shared/misc";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { RatingStatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useReviewRating, useReviews } from "@/features/reviews/api";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDate, formatRelative, shortId } from "@/lib/format";
import type { Rating, RatingStatus } from "@/types/api";

export default function ReviewsPage() {
  const { get, set, page } = useUrlState();
  const status = (get("status") as RatingStatus | undefined) ?? "pending";
  const { data, isLoading, isFetching, error, refetch } = useReviews(status, page);
  const review = useReviewRating();
  const [target, setTarget] = useState<{ rating: Rating; decision: "approved" | "rejected" } | null>(null);
  const [note, setNote] = useState("");

  const decide = () => {
    if (!target) return;
    review.mutate(
      { id: target.rating.id, status: target.decision, reviewNote: note },
      {
        onSuccess: () => {
          toast.success(target.decision === "approved" ? "Review approved" : "Review rejected");
          setTarget(null);
          setNote("");
        },
      },
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reviews"
        description="Approved reviews count towards a professional's rating and appear in the app."
      />
      <Tabs value={status} onValueChange={(v) => set({ status: v === "pending" ? undefined : v })}>
        <TabsList variant="line">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <EmptyState
          icon={MessageSquareQuoteIcon}
          title={status === "pending" ? "You're all caught up" : `No ${status} reviews`}
          description={status === "pending" ? "New customer reviews will show up here for moderation." : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className={`grid gap-3 md:grid-cols-2 ${isFetching ? "opacity-60" : ""}`}>
            {data.items.map((r) => (
              <Card key={r.id} size="sm">
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <PersonAvatar name={r.user?.name} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{r.user?.name || "Customer"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.subservice?.name ?? r.service?.name ?? "Service"} · {formatRelative(r.createdAt)}
                      </p>
                    </div>
                    {status !== "pending" && <RatingStatusBadge status={r.status} />}
                  </div>
                  <Stars value={r.rating} className="[&_svg]:size-4" />
                  <p className="flex-1 text-sm whitespace-pre-wrap">{r.feedback || <span className="text-muted-foreground italic">No written feedback</span>}</p>
                  {r.reviewNote && (
                    <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                      Note: {r.reviewNote}
                      {r.reviewedBy?.name ? ` — ${r.reviewedBy.name}` : ""}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    {r.booking ? (
                      <Link href={`/bookings/${r.booking.id}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
                        Booking {shortId(r.booking.id)} · {formatDate(r.booking.date, "d MMM")}
                      </Link>
                    ) : (
                      <span />
                    )}
                    {status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setTarget({ rating: r, decision: "rejected" })}>
                          <XIcon data-icon="inline-start" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => setTarget({ rating: r, decision: "approved" })}>
                          <CheckIcon data-icon="inline-start" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <TablePagination pagination={data.pagination} onPageChange={(p) => set({ page: p }, { resetPage: false })} />
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => {
          if (!o) {
            setTarget(null);
            setNote("");
          }
        }}
        title={target?.decision === "approved" ? "Approve this review?" : "Reject this review?"}
        description={
          target?.decision === "approved"
            ? "It will count towards the professional's rating."
            : "It won't be shown or counted. The customer isn't notified."
        }
        confirmLabel={target?.decision === "approved" ? "Approve" : "Reject"}
        destructive={target?.decision === "rejected"}
        pending={review.isPending}
        onConfirm={decide}
      >
        <Field>
          <FieldLabel htmlFor="review-note">Internal note (optional)</FieldLabel>
          <Textarea id="review-note" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </ConfirmDialog>
    </PageContainer>
  );
}
