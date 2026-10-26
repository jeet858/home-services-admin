"use client";

import {
  BadgeCheckIcon,
  BanIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MailIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Lightbox, Thumb } from "@/components/shared/image-preview";
import { DescriptionList, PersonAvatar, Stars } from "@/components/shared/misc";
import { PageContainer } from "@/components/shared/page-header";
import { BOOKING_STATUS, ProviderStatusBadge } from "@/components/shared/status-badge";
import { DetailSkeleton, ErrorState } from "@/components/shared/states";
import { useBookings } from "@/features/bookings/api";
import { BookingsTable } from "@/features/bookings/bookings-table";
import { formatCurrency, formatDate, formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingStatus, KycCard, ServiceProvider } from "@/types/api";
import {
  useDeleteProvider,
  useProvider,
  useProviderStats,
  useSetProviderStatus,
  useSuspendProvider,
  useVerifyDocument,
  useVerifyProvider,
} from "./api";
import { WEEKDAYS } from "./provider-form";

export function ProviderDetail({ id }: { id: string }) {
  const { data: provider, isLoading, error, refetch } = useProvider(id);
  if (isLoading) {
    return (
      <PageContainer>
        <DetailSkeleton />
      </PageContainer>
    );
  }
  if (error || !provider) {
    return (
      <PageContainer>
        <ErrorState error={error ?? new Error("Professional not found")} onRetry={() => refetch()} />
      </PageContainer>
    );
  }
  return <ProviderView provider={provider} />;
}

function ProviderView({ provider: p }: { provider: ServiceProvider }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"verify" | "suspend" | "delete" | null>(null);
  const [note, setNote] = useState("");
  const verify = useVerifyProvider();
  const suspend = useSuspendProvider();
  const setStatus = useSetProviderStatus();
  const remove = useDeleteProvider();

  const close = () => {
    setDialog(null);
    setNote("");
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <PersonAvatar name={p.name} src={p.passportPhoto} className="size-16 text-lg" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{p.name}</h1>
            <ProviderStatusBadge status={p.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Stars value={p.rating?.average ?? 0} />
              {p.rating?.totalRatings ? `${p.rating.average.toFixed(1)} (${p.rating.totalRatings})` : "No ratings yet"}
            </span>
            <span>Joined {formatDate(p.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.status !== "active" && p.status !== "suspended" && (
            <Button onClick={() => setDialog("verify")}>
              <BadgeCheckIcon data-icon="inline-start" />
              Verify & activate
            </Button>
          )}
          {p.status === "suspended" || p.status === "inactive" ? (
            <Button
              variant="outline"
              disabled={setStatus.isPending}
              onClick={() => setStatus.mutate({ id: p.id, status: "active" }, { onSuccess: () => toast.success(`${p.name} reactivated`) })}
            >
              <PlayCircleIcon data-icon="inline-start" />
              Reactivate
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href={`/providers/${p.id}/edit`}>
              <PencilIcon data-icon="inline-start" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {p.status === "active" && (
                <DropdownMenuItem
                  onSelect={() => setStatus.mutate({ id: p.id, status: "inactive" }, { onSuccess: () => toast.success("Marked inactive") })}
                >
                  <PlayCircleIcon />
                  Mark inactive
                </DropdownMenuItem>
              )}
              {p.status !== "suspended" && (
                <DropdownMenuItem onSelect={() => setDialog("suspend")}>
                  <BanIcon />
                  Suspend
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview" className="gap-4">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule & payouts</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview">
          <Overview p={p} />
        </TabsContent>
        <TabsContent value="kyc">
          <Kyc p={p} />
        </TabsContent>
        <TabsContent value="bookings">
          <ProviderBookings providerId={p.id} />
        </TabsContent>
        <TabsContent value="schedule">
          <Schedule p={p} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={dialog === "verify"}
        onOpenChange={(o) => !o && close()}
        title={`Verify ${p.name}?`}
        description="Marks both Aadhaar and PAN as verified and activates the professional so they can be assigned bookings."
        confirmLabel="Verify & activate"
        pending={verify.isPending}
        onConfirm={() =>
          verify.mutate(
            { id: p.id, notes: note || undefined },
            {
              onSuccess: () => {
                toast.success(`${p.name} verified`);
                close();
              },
            },
          )
        }
      >
        <NoteField value={note} onChange={setNote} label="Verification note (optional)" />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "suspend"}
        onOpenChange={(o) => !o && close()}
        title={`Suspend ${p.name}?`}
        description="They won't be offered for new bookings until reactivated."
        confirmLabel="Suspend"
        destructive
        pending={suspend.isPending}
        onConfirm={() =>
          suspend.mutate(
            { id: p.id, reason: note || undefined },
            {
              onSuccess: () => {
                toast.success(`${p.name} suspended`);
                close();
              },
            },
          )
        }
      >
        <NoteField value={note} onChange={setNote} label="Reason" />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(o) => !o && close()}
        title={`Delete ${p.name}?`}
        description="This can't be undone. Professionals with upcoming bookings can't be deleted — reassign those first."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(p.id, {
            onSuccess: () => {
              toast.success(`${p.name} deleted`);
              router.replace("/providers");
            },
          })
        }
      />
    </PageContainer>
  );
}

function NoteField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <Field>
      <FieldLabel htmlFor="provider-note">{label}</FieldLabel>
      <Textarea id="provider-note" value={value} maxLength={500} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function Overview({ p }: { p: ServiceProvider }) {
  const { data: stats, isLoading } = useProviderStats(p.id);
  const total = p.rating?.totalRatings ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {isLoading || !stats ? (
            Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : (
            <>
              <StatTile label="Total bookings" value={String(stats.bookings.total)} />
              <StatTile label="Completed" value={String(stats.bookings.byStatus.completed ?? 0)} />
              <StatTile
                label="Upcoming"
                value={String((stats.bookings.byStatus.pending ?? 0) + (stats.bookings.byStatus.confirmed ?? 0))}
              />
              <StatTile label="Earnings" value={formatCurrency(stats.earnings.totalEarnings)} />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              items={[
                {
                  label: "Phone",
                  value: (
                    <a href={`tel:${p.phoneNumber}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                      <PhoneIcon className="size-3.5" /> {formatPhone(p.phoneNumber)}
                    </a>
                  ),
                },
                {
                  label: "Email",
                  value: (
                    <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 break-all hover:text-primary">
                      <MailIcon className="size-3.5" /> {p.email}
                    </a>
                  ),
                },
                {
                  label: "Address",
                  value: p.address ? (
                    <span className="inline-flex items-start gap-1.5">
                      <MapPinIcon className="mt-0.5 size-3.5 shrink-0" /> {p.address}
                    </span>
                  ) : null,
                },
                { label: "Experience", value: p.experience ? `${p.experience} ${p.experienceUnit}` : null },
                { label: "Qualification", value: p.qualification },
                { label: "Commission", value: p.commission != null ? `${p.commission}%` : null },
                {
                  label: "Services",
                  value: p.services.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {p.services.map((s) => (
                        <Badge key={s.id} variant="secondary" className="bg-primary-soft text-primary-soft-foreground">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null,
                },
                {
                  label: "Sub-services",
                  value: p.subservices.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {p.subservices.map((s) => (
                        <Badge key={s.id} variant="outline">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null,
                },
                {
                  label: "Specializations",
                  value: p.specializations?.length ? p.specializations.join(", ") : null,
                },
                {
                  label: "Verified",
                  value: p.verifiedAt ? `${formatDate(p.verifiedAt)}${p.verifiedBy?.name ? ` by ${p.verifiedBy.name}` : ""}` : null,
                },
              ]}
            />
            {p.notes && (
              <div className="mt-4 rounded-xl bg-muted/60 p-3 text-sm">
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Notes</p>
                <p className="whitespace-pre-wrap">{p.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ratings</CardTitle>
            <CardDescription>From approved customer reviews</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-3">
              <span className="font-heading text-4xl font-semibold tabular-nums">{total ? p.rating.average.toFixed(1) : "—"}</span>
              <div className="pb-1">
                <Stars value={p.rating?.average ?? 0} />
                <p className="text-xs text-muted-foreground">{total} reviews</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {(["5", "4", "3", "2", "1"] as const).map((star) => {
                const count = p.rating?.ratingDistribution?.[star] ?? 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted-foreground">{star}</span>
                    <Progress value={total ? (count / total) * 100 : 0} className="h-1.5 flex-1" />
                    <span className="w-6 text-right text-muted-foreground tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        {stats && Object.keys(stats.bookings.byStatus).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bookings by status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {(Object.entries(stats.bookings.byStatus) as [BookingStatus, number][]).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-muted-foreground">{BOOKING_STATUS[status]?.label ?? status}</span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function Kyc({ p }: { p: ServiceProvider }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
      <KycDocCard providerId={p.id} type="aadhaarCard" title="Aadhaar card" card={p.aadhaarCard} />
      <KycDocCard providerId={p.id} type="panCard" title="PAN card" card={p.panCard} />
      {p.passportPhoto && (
        <Card>
          <CardHeader>
            <CardTitle>Passport photo</CardTitle>
          </CardHeader>
          <CardContent>
            <Lightbox src={p.passportPhoto} alt="Passport photo">
              <button type="button" className="block w-40 overflow-hidden rounded-xl ring-1 ring-border">
                <Thumb src={p.passportPhoto} alt="Passport photo" className="aspect-[3/4] size-auto w-full rounded-none" />
              </button>
            </Lightbox>
          </CardContent>
        </Card>
      )}
      {(p.certifications?.length ?? 0) + (p.documents?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Certifications & documents</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y text-sm">
            {p.certifications?.map((c, i) => (
              <div key={c.id ?? i} className="flex flex-col py-2 first:pt-0">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {c.issuingAuthority}
                  {c.issueDate ? ` · ${formatDate(c.issueDate)}` : ""}
                  {c.expiryDate ? ` – ${formatDate(c.expiryDate)}` : ""}
                </span>
              </div>
            ))}
            {p.documents?.map((d, i) => (
              <a
                key={d.id ?? i}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 py-2 first:pt-0 hover:text-primary"
              >
                <FileTextIcon className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="text-xs text-muted-foreground">{d.type}</span>
                <ExternalLinkIcon className="size-3.5" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KycDocCard({
  providerId,
  type,
  title,
  card,
}: {
  providerId: string;
  type: "aadhaarCard" | "panCard";
  title: string;
  card: KycCard;
}) {
  const verifyDoc = useVerifyDocument();
  const verified = Boolean(card?.verified);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {verified && <ShieldCheckIcon className="size-4 text-success" />}
        </CardTitle>
        <CardDescription className="font-mono">{card?.number || "No number on file"}</CardDescription>
        <CardAction>
          <label className="flex items-center gap-2 text-sm">
            <span className={cn(verified ? "text-success" : "text-muted-foreground")}>{verified ? "Verified" : "Unverified"}</span>
            <Switch
              checked={verified}
              disabled={verifyDoc.isPending || (!card?.number && !card?.image)}
              onCheckedChange={(next) =>
                verifyDoc.mutate(
                  { id: providerId, documentType: type, verified: next },
                  { onSuccess: () => toast.success(`${title} ${next ? "verified" : "marked unverified"}`) },
                )
              }
            />
          </label>
        </CardAction>
      </CardHeader>
      <CardContent>
        {card?.image ? (
          <Lightbox src={card.image} alt={title}>
            <button type="button" className="block w-full overflow-hidden rounded-xl ring-1 ring-border">
              <Thumb src={card.image} alt={title} className="aspect-[16/10] size-auto w-full rounded-none" />
            </button>
          </Lightbox>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No image uploaded
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProviderBookings({ providerId }: { providerId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useBookings({ providerId, page, limit: 10 });
  return (
    <BookingsTable
      data={data?.items}
      loading={isLoading}
      fetching={isFetching && !isLoading}
      pagination={data?.pagination}
      onPageChange={setPage}
    />
  );
}

function Schedule({ p }: { p: ServiceProvider }) {
  const bank = p.bankDetails ?? {};
  const masked = bank.accountNumber ? `•••• ${bank.accountNumber.slice(-4)}` : null;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly availability</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y text-sm">
          {WEEKDAYS.map((day) => {
            const d = p.availability?.[day];
            const on = d?.available !== false;
            return (
              <div key={day} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <span className="capitalize">{day}</span>
                <span className={cn("tabular-nums", !on && "text-muted-foreground")}>
                  {on ? (d?.start && d?.end ? `${d.start} – ${d.end}` : "Available") : "Off"}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bank details</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList
            items={[
              { label: "Account holder", value: bank.accountHolderName },
              { label: "Bank", value: bank.bankName },
              { label: "Account", value: masked && <span className="font-mono">{masked}</span> },
              { label: "IFSC", value: bank.ifscCode && <span className="font-mono">{bank.ifscCode}</span> },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
