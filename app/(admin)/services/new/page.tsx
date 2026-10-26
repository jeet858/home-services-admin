"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { useCreateService } from "@/features/services/api";
import { CatalogueForm, toCatalogueInput } from "@/features/services/catalogue-form";

export default function NewServicePage() {
  const router = useRouter();
  const create = useCreateService();

  return (
    <PageContainer>
      <PageHeader title="New service" description="Add a category that groups related sub-services." />
      <CatalogueForm
        kind="service"
        submitLabel="Create service"
        pending={create.isPending}
        onCancel={() => router.back()}
        onSubmit={(values) =>
          create.mutate(toCatalogueInput(values), {
            onSuccess: (service) => {
              toast.success(`${service.name} created`);
              router.replace(`/services/${service.id}`);
            },
          })
        }
      />
    </PageContainer>
  );
}
