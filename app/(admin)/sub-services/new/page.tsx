"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { useCreateSubservice, useServices } from "@/features/services/api";
import { CatalogueForm, toCatalogueInput } from "@/features/services/catalogue-form";

export default function NewSubservicePage() {
  const router = useRouter();
  const preselected = useSearchParams().get("serviceId") ?? "";
  const { data: services } = useServices();
  const create = useCreateSubservice();

  return (
    <PageContainer>
      <PageHeader title="New sub-service" description="Add a bookable item under a service." />
      <CatalogueForm
        kind="subservice"
        services={services}
        defaultValues={{ serviceId: preselected }}
        submitLabel="Create sub-service"
        pending={create.isPending}
        onCancel={() => router.back()}
        onSubmit={(values) =>
          create.mutate(
            { ...toCatalogueInput(values), serviceId: values.serviceId! },
            {
              onSuccess: (sub) => {
                toast.success(`${sub.name} created`);
                router.replace(`/sub-services/${sub.id}`);
              },
            },
          )
        }
      />
    </PageContainer>
  );
}
