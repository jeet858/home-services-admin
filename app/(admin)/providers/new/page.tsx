"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { useCreateProvider } from "@/features/providers/api";
import { ProviderForm } from "@/features/providers/provider-form";

export default function NewProviderPage() {
  const router = useRouter();
  const create = useCreateProvider();

  return (
    <PageContainer>
      <PageHeader
        title="Add professional"
        description="New professionals start as “verification pending” until their KYC is checked."
      />
      <ProviderForm
        submitLabel="Add professional"
        pending={create.isPending}
        onCancel={() => router.back()}
        onSubmit={(body) =>
          create.mutate(body, {
            onSuccess: (provider) => {
              toast.success(`${provider.name} added`);
              router.replace(`/providers/${provider.id}`);
            },
          })
        }
      />
    </PageContainer>
  );
}
