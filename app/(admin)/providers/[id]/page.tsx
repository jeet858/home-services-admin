import { ProviderDetail } from "@/features/providers/provider-detail";

export const metadata = { title: "Professional" };

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProviderDetail id={id} />;
}
