"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CommandMenu } from "./command-menu";
import { NAV_ITEMS } from "./nav-config";

const SEGMENT_LABELS: Record<string, string> = {
  new: "New",
  edit: "Edit",
};

function crumbs(pathname: string) {
  if (pathname === "/") return [{ href: "/", label: "Dashboard" }];
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => {
    const href = `/${parts.slice(0, i + 1).join("/")}`;
    const nav = NAV_ITEMS.find((item) => item.href === href);
    const label = nav?.title ?? SEGMENT_LABELS[part] ?? "Details";
    return { href, label };
  });
}

export function SiteHeader() {
  const pathname = usePathname();
  const items = crumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 md:rounded-t-xl">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {items.map((item, i) => (
            <Fragment key={item.href}>
              {i > 0 && <BreadcrumbSeparator className="hidden sm:block" />}
              <BreadcrumbItem className={i < items.length - 1 ? "hidden sm:inline-flex" : "truncate"}>
                {i < items.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <CommandMenu />
    </header>
  );
}
