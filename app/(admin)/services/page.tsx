"use client";

import { ClockIcon, LayersIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput, TableToolbar } from "@/components/data-table/toolbar";
import { Thumb } from "@/components/shared/image-preview";
import { Price } from "@/components/shared/misc";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useServices } from "@/features/services/api";

export default function ServicesPage() {
  const { data, isLoading, error, refetch } = useServices();
  const [search, setSearch] = useState<string>();

  const services = useMemo(() => {
    const term = search?.toLowerCase();
    return (data ?? []).filter((s) => !term || s.name.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term));
  }, [data, search]);

  return (
    <PageContainer>
      <PageHeader
        title="Services"
        description="Top-level categories customers browse in the app."
        actions={
          <Button asChild>
            <Link href="/services/new">
              <PlusIcon data-icon="inline-start" />
              New service
            </Link>
          </Button>
        }
      />
      <TableToolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search services" />
      </TableToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={LayersIcon}
          title={search ? "No matching services" : "No services yet"}
          description={search ? "Try a different search." : "Create your first service category to start taking bookings."}
          action={
            !search && (
              <Button asChild>
                <Link href="/services/new">New service</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`} className="group rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
              <Card className="h-full pt-0 transition-shadow group-hover:shadow-md">
                <Thumb src={service.image} alt={service.name} className="aspect-[16/9] size-auto w-full rounded-none" />
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-base font-semibold">{service.name}</h3>
                    <Price original={service.originalPrice} discounted={service.discountedPrice} />
                  </div>
                  {service.description && <p className="line-clamp-2 text-sm text-muted-foreground">{service.description}</p>}
                  <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="size-3.5" />
                      {service.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <LayersIcon className="size-3.5" />
                      {service.subservices?.length ?? 0} sub-services
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
