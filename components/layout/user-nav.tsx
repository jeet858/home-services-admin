"use client";

import { ChevronsUpDownIcon, DownloadIcon, LogOutIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { PersonAvatar } from "@/components/shared/misc";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { clearSession, getProfile, getTokenClaims } from "@/lib/auth";
import type { User } from "@/types/api";

export function useCurrentAdmin() {
  const [admin, setAdmin] = useState<Pick<User, "id" | "name" | "email"> | null>(null);
  useEffect(() => {
    const profile = getProfile();
    if (profile) return setAdmin(profile);
    const claims = getTokenClaims();
    if (claims.id) setAdmin({ id: claims.id, name: null, email: claims.email ?? null });
  }, []);
  return admin;
}

export function UserNav() {
  const admin = useCurrentAdmin();
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { canInstall, install } = useInstallPrompt();
  const queryClient = useQueryClient();

  const logout = () => {
    clearSession();
    queryClient.clear();
    window.location.replace("/login");
  };

  const name = admin?.name || "Admin";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <PersonAvatar name={name} className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{admin?.email ?? "Administrator"}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2 text-left text-sm">
                <PersonAvatar name={name} className="size-8 rounded-lg" />
                <div className="grid flex-1 leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">{admin?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SunIcon className="dark:hidden" />
                  <MoonIcon className="hidden dark:block" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">
                      <SunIcon /> Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <MoonIcon /> Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <MonitorIcon /> System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {canInstall && (
                <DropdownMenuItem onSelect={install}>
                  <DownloadIcon />
                  Install app
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={logout}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
