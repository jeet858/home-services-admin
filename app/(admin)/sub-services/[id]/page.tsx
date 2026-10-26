"use client";

import { Trash2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton, ErrorState } from "@/components/shared/states";
import { useDeleteSubservice, useServices, useSubservice, useUpdateSubservice } from "@/features/services/api";
import { CatalogueForm, toCatalogueInput } from "@/features/services/catalogue-form";

export default function EditSubservicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: sub, isLoading, error, refetch } = useSubservice(id);
  const { data: services } = useServices();
  const update = useUpdateSubservice();
  const remove = useDeleteSubservice();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <PageContainer>
        <DetailSkeleton />
      </PageContainer>
    );
  }
  if (error || !sub) {
    return (
      <PageContainer>
        <ErrorState error={error ?? new Error("Sub-service not found")} onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={sub.name}
        description={sub.service?.name ? `Part of ${sub.service.name}` : undefined}
        actions={
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        }
      />
      <CatalogueForm
        key={sub.id}
        kind="subservice"
        services={services}
        lockService
        lockImage
        submitLabel="Save changes"
        pending={update.isPending}
        defaultValues={{
          serviceId: sub.serviceId,
          name: sub.name,
          description: sub.description ?? "",
          process: sub.process ?? "",
          originalPrice: sub.originalPrice,
          discountedPrice: sub.discountedPrice,
          duration: sub.duration,
          image: sub.image ?? "",
        }}
        onSubmit={(values) =>
          update.mutate({ id: sub.id, ...toCatalogueInput(values) }, { onSuccess: () => toast.success("Sub-service updated") })
        }
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${sub.name}?`}
        description="Customers will no longer be able to book it. Items with ratings can't be deleted."
        confirmLabel="Delete sub-service"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(sub.id, {
            onSuccess: () => {
              toast.success(`${sub.name} deleted`);
              router.replace("/sub-services");
            },
          })
        }
      />
    </PageContainer>
  );
}
