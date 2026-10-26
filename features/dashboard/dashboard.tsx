"use client";

import {
  ArrowRightIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  HardHatIcon,
  IndianRupeeIcon,
  StarIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/states";
import { useBookings } from "@/features/bookings/api";
import { useProviders } from "@/features/providers/api";
import { formatCompact, formatCurrency, formatDate, shortId } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "./api";

const trendConfig = {
  bookings: { label: "Bookings", color: "var(--chart-1)" },
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

const topConfig = { bookings: { label: "Bookings", color: "var(--chart-1)" } } satisfies ChartConfig;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function Dashboard() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const [metric, setMetric] = useState<"bookings" | "revenue">("bookings");

  const totalBookings = useMemo(
    () => (stats ? Object.values(stats.totals.bookings).reduce((a, b) => a + (b ?? 0), 0) : 0),
    [stats],
  );

  const kpis = stats
    ? [
        { label: "Today's bookings", value: String(stats.totals.today), icon: CalendarDaysIcon, href: "/bookings" },
        {
          label: "Upcoming",
          value: String(stats.totals.upcoming),
          hint: stats.totals.unassignedUpcoming ? `${stats.totals.unassignedUpcoming} unassigned` : "All assigned",
          warn: stats.totals.unassignedUpcoming > 0,
          icon: CalendarClockIcon,
          href: "/bookings?status=pending",
        },
        {
          label: "Revenue",
          value: formatCurrency(stats.totals.revenue),
          hint: stats.totals.tips ? `+ ${formatCurrency(stats.totals.tips)} in tips` : "Completed or paid",
          icon: IndianRupeeIcon,
        },
        { label: "Customers", value: formatCompact(stats.totals.customers), icon: UsersIcon, href: "/customers" },
        {
          label: "Active professionals",
          value: String(stats.totals.providers.active ?? 0),
          hint: stats.totals.providers.verification_pending
            ? `${stats.totals.providers.verification_pending} awaiting verification`
            : undefined,
          warn: Boolean(stats.totals.providers.verification_pending),
          icon: HardHatIcon,
          href: "/providers",
        },
        {
          label: "Reviews to moderate",
          value: String(stats.totals.pendingRatings),
          warn: stats.totals.pendingRatings > 0,
          icon: StarIcon,
          href: "/reviews",
        },
      ]
    : [];

  return (
    <PageContainer>
      <PageHeader
        title={greeting()}
        description="Here's what's happening across Subidha today."
        actions={
          <Button asChild>
            <Link href="/bookings?unassigned=true">
              <UserPlusIcon data-icon="inline-start" />
              Assign bookings
            </Link>
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
              : kpis.map((kpi) => {
                  const body = (
                    <Card size="sm" className="h-full transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardDescription className="flex items-center justify-between gap-2">
                          <span className="truncate">{kpi.label}</span>
                          <kpi.icon className="size-4 shrink-0 text-primary" />
                        </CardDescription>
                        <CardTitle className="font-heading text-2xl font-semibold tabular-nums">{kpi.value}</CardTitle>
                      </CardHeader>
                      {kpi.hint && (
                        <CardContent>
                          <p className={cn("text-xs text-muted-foreground", kpi.warn && "font-medium text-warning-soft-foreground")}>
                            {kpi.hint}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  );
                  return kpi.href ? (
                    <Link key={kpi.label} href={kpi.href} className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                      {body}
                    </Link>
                  ) : (
                    <div key={kpi.label}>{body}</div>
                  );
                })}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Last 30 days</CardTitle>
                <CardDescription>
                  {stats ? `${totalBookings.toLocaleString("en-IN")} bookings all-time` : "Bookings and revenue by day"}
                </CardDescription>
                <CardAction>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    value={metric}
                    onValueChange={(v) => v && setMetric(v as typeof metric)}
                  >
                    <ToggleGroupItem value="bookings">Bookings</ToggleGroupItem>
                    <ToggleGroupItem value="revenue">Revenue</ToggleGroupItem>
                  </ToggleGroup>
                </CardAction>
              </CardHeader>
              <CardContent>
                {isLoading || !stats ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ChartContainer config={trendConfig} className="aspect-auto h-64 w-full">
                    <AreaChart data={stats.series} margin={{ left: 4, right: 8, top: 8 }}>
                      <defs>
                        <linearGradient id="fillTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={`var(--color-${metric})`} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={`var(--color-${metric})`} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={28}
                        tickFormatter={(v: string) => formatDate(v, "d MMM")}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={metric === "revenue" ? 56 : 32}
                        allowDecimals={false}
                        tickFormatter={(v: number) => (metric === "revenue" ? `₹${formatCompact(v)}` : String(v))}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="line"
                            labelFormatter={(v) => formatDate(String(v), "EEE, d MMM")}
                            formatter={(value) => (
                              <span className="font-mono font-medium tabular-nums">
                                {metric === "revenue" ? formatCurrency(Number(value)) : Number(value)}
                              </span>
                            )}
                          />
                        }
                      />
                      <Area
                        dataKey={metric}
                        type="monotone"
                        fill="url(#fillTrend)"
                        stroke={`var(--color-${metric})`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top services</CardTitle>
                <CardDescription>By number of bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || !stats ? (
                  <Skeleton className="h-64 w-full" />
                ) : stats.topServices.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No bookings yet</p>
                ) : (
                  <ChartContainer config={topConfig} className="aspect-auto h-64 w-full">
                    <BarChart data={stats.topServices} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <XAxis type="number" hide allowDecimals={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={104}
                        tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
                      <Bar dataKey="bookings" fill="var(--color-bookings)" radius={6} barSize={18} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <NeedsAssignment />
            <PendingVerification />
          </div>
        </>
      )}
    </PageContainer>
  );
}

function NeedsAssignment() {
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), []);
  const { data, isLoading } = useBookings({ unassigned: true, from: today, limit: 5 });
  const items = (data?.items ?? []).filter((b) => b.status === "pending" || b.status === "confirmed");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs a professional</CardTitle>
        <CardDescription>Upcoming bookings without an assignment</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/bookings?unassigned=true">
              View all <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12" />)
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Every upcoming booking has a professional 🎉</p>
        ) : (
          items.map((b) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
            >
              <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                <span className="text-[10px] leading-none font-medium uppercase">{formatDate(b.date, "MMM")}</span>
                <span className="text-sm leading-tight font-semibold">{formatDate(b.date, "d")}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.services.map((s) => s.name).join(", ") || "Service"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {b.time} · {b.user?.name || shortId(b.id)} · {b.address?.city ?? "—"}
                </p>
              </div>
              <BookingStatusBadge status={b.status} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function PendingVerification() {
  const { data, isLoading } = useProviders({ status: "verification_pending", limit: 5 });
  const items = data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Awaiting verification</CardTitle>
        <CardDescription>Professionals with KYC still to review</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/providers?status=verification_pending">
              View all <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12" />)
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No pending verifications</p>
        ) : (
          items.map((p) => (
            <Link
              key={p.id}
              href={`/providers/${p.id}`}
              className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.services.map((s) => s.name).join(", ") || "No services"} · joined {formatDate(p.createdAt)}
                </p>
              </div>
              <div className="flex gap-1 text-xs">
                <KycPill label="Aadhaar" ok={p.aadhaarCard?.verified} />
                <KycPill label="PAN" ok={p.panCard?.verified} />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function KycPill({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 font-medium",
        ok ? "bg-success-soft text-success-soft-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
