"use client";

import { CalendarSearchIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { NAV } from "./nav-config";

const CREATE_ACTIONS = [
  { title: "New service", href: "/services/new" },
  { title: "New sub-service", href: "/sub-services/new" },
  { title: "Add professional", href: "/providers/new" },
  { title: "New coupon", href: "/coupons?new=1" },
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const trimmed = query.trim();

  return (
    <>
      <Button
        variant="outline"
        className="h-8 w-9 justify-center gap-2 px-0 text-muted-foreground sm:w-56 sm:justify-start sm:px-2.5"
        onClick={() => setOpen(true)}
      >
        <SearchIcon />
        <span className="hidden flex-1 text-left font-normal sm:inline">Search…</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Jump to a page or booking">
        <Command>
          <CommandInput placeholder="Go to a page, or paste a booking ID / phone…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            {trimmed && (
              <CommandGroup heading="Bookings">
                {UUID.test(trimmed) ? (
                  <CommandItem value={`open booking ${trimmed}`} onSelect={() => go(`/bookings/${trimmed}`)}>
                    <CalendarSearchIcon />
                    Open booking {trimmed.slice(0, 8)}…
                  </CommandItem>
                ) : (
                  <CommandItem value={`search bookings ${trimmed}`} onSelect={() => go(`/bookings?search=${encodeURIComponent(trimmed)}`)}>
                    <CalendarSearchIcon />
                    Search bookings for “{trimmed}”
                  </CommandItem>
                )}
              </CommandGroup>
            )}
            {NAV.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.title} ${item.keywords?.join(" ") ?? ""}`}
                    onSelect={() => go(item.href)}
                  >
                    <item.icon />
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandSeparator />
            <CommandGroup heading="Create">
              {CREATE_ACTIONS.map((action) => (
                <CommandItem key={action.href} value={action.title} onSelect={() => go(action.href)}>
                  <PlusIcon />
                  {action.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
