"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoMark } from "@/components/shared/logo";
import { useDashboardStats } from "@/features/dashboard/api";
import { NAV, isActivePath } from "./nav-config";
import { UserNav } from "./user-nav";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: stats } = useDashboardStats();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <LogoMark />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-base font-semibold text-primary">Subidha</span>
                  <span className="truncate text-xs text-muted-foreground">Admin console</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const count = stats && item.badge ? item.badge(stats) : 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActivePath(pathname, item.href)} tooltip={item.title}>
                      <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {count > 0 && (
                      <SidebarMenuBadge className="rounded-full bg-primary-soft px-1.5 text-primary-soft-foreground">
                        {count > 99 ? "99+" : count}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="pb-safe">
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
