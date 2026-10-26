import {
  CalendarCheckIcon,
  HardHatIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ListTreeIcon,
  type LucideIcon,
  ShieldCheckIcon,
  StarIcon,
  TicketPercentIcon,
  UsersIcon,
} from "lucide-react";
import type { DashboardStats } from "@/types/api";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  // Pulls an "needs attention" count from the dashboard stats for the sidebar badge.
  badge?: (stats: DashboardStats) => number;
  keywords?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboardIcon, keywords: ["home", "stats"] }],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Bookings",
        href: "/bookings",
        icon: CalendarCheckIcon,
        badge: (s) => s.totals.unassignedUpcoming,
        keywords: ["orders", "jobs", "assign"],
      },
      {
        title: "Professionals",
        href: "/providers",
        icon: HardHatIcon,
        badge: (s) => s.totals.providers.verification_pending ?? 0,
        keywords: ["providers", "workers", "kyc", "verify"],
      },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { title: "Services", href: "/services", icon: LayersIcon, keywords: ["categories"] },
      { title: "Sub-services", href: "/sub-services", icon: ListTreeIcon, keywords: ["items", "prices"] },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Customers", href: "/customers", icon: UsersIcon, keywords: ["users", "clients"] },
      {
        title: "Reviews",
        href: "/reviews",
        icon: StarIcon,
        badge: (s) => s.totals.pendingRatings,
        keywords: ["ratings", "feedback", "moderation"],
      },
    ],
  },
  {
    label: "Marketing",
    items: [{ title: "Coupons", href: "/coupons", icon: TicketPercentIcon, keywords: ["offers", "discounts", "promo"] }],
  },
  {
    label: "Settings",
    items: [{ title: "Team", href: "/team", icon: ShieldCheckIcon, keywords: ["admins", "staff"] }],
  },
];

export const NAV_ITEMS = NAV.flatMap((g) => g.items);

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
