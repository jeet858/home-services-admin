import { cookies } from "next/headers";
import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { DetailSkeleton } from "@/components/shared/states";
import { PageContainer } from "@/components/shared/page-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  // Written by the shadcn sidebar when it is toggled.
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="pt-safe">
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <Suspense
          fallback={
            <PageContainer>
              <DetailSkeleton />
            </PageContainer>
          }
        >
          {children}
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
