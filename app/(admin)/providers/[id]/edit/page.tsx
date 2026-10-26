"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton, ErrorState } from "@/components/shared/states";
import { useProvider, useUpdateProvider } from "@/features/providers/api";
import { ProviderForm } from "@/features/providers/provider-form";

export default function EditProviderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: provider, isLoading, error, refetch } = useProvider(id);
  const update = useUpdateProvider();

  return (
    <PageContainer>
      {isLoading ? (
        <DetailSkeleton />
      ) : error || !provider ? (
        <ErrorState error={error ?? new Error("Professional not found")} onRetry={() => refetch()} />
      ) : (
        <>
          <PageHeader title={`Edit ${provider.name}`} />
          <ProviderForm
            key={provider.updatedAt}
            provider={provider}
            submitLabel="Save changes"
            pending={update.isPending}
            onCancel={() => router.back()}
            onSubmit={(body) =>
              update.mutate(
                { id, body },
                {
                  onSuccess: () => {
                    toast.success("Profile updated");
                    router.replace(`/providers/${id}`);
                  },
                },
              )
            }
          />
        </>
      )}
    </PageContainer>
  );
}
