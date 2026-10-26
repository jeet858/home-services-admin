"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Thumb } from "@/components/shared/image-preview";
import { Price } from "@/components/shared/misc";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton, ErrorState } from "@/components/shared/states";
import { useDeleteService, useService, useUpdateService } from "@/features/services/api";
import { CatalogueForm, toCatalogueInput } from "@/features/services/catalogue-form";

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading, error, refetch } = useService(id);
  const update = useUpdateService();
  const remove = useDeleteService();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <PageContainer>
        <DetailSkeleton />
      </PageContainer>
    );
  }
  if (error || !service) {
    return (
      <PageContainer>
        <ErrorState error={error ?? new Error("Service not found")} onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  const subservices = service.subservices ?? [];

  return (
    <PageContainer>
      <PageHeader
        title={service.name}
        description="Edit details, pricing and the sub-services under this category."
        actions={
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        }
      />

      <CatalogueForm
        key={service.id}
        kind="service"
        submitLabel="Save changes"
        pending={update.isPending}
        defaultValues={{
          name: service.name,
          description: service.description ?? "",
          process: service.process ?? "",
          originalPrice: service.originalPrice,
          discountedPrice: service.discountedPrice,
          duration: service.duration,
          image: service.image ?? "",
        }}
        onSubmit={(values) =>
          update.mutate({ id: service.id, ...toCatalogueInput(values) }, { onSuccess: () => toast.success("Service updated") })
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Sub-services</CardTitle>
          <CardDescription>{subservices.length} bookable items in {service.name}</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/sub-services/new?serviceId=${service.id}`}>
                <PlusIcon data-icon="inline-start" />
                Add
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {subservices.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sub-services yet.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {subservices.map((sub) => (
                <li key={sub.id}>
                  <Link href={`/sub-services/${sub.id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-accent/50">
                    <Thumb src={sub.image} alt={sub.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{sub.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{sub.duration}</p>
                    </div>
                    <Price original={sub.originalPrice} discounted={sub.discountedPrice} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${service.name}?`}
        description={`This also deletes its ${subservices.length} sub-services. Services with customer ratings can't be deleted.`}
        confirmLabel="Delete service"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(service.id, {
            onSuccess: () => {
              toast.success(`${service.name} deleted`);
              router.replace("/services");
            },
          })
        }
      />
    </PageContainer>
  );
}
