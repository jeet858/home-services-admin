"use client";

import { CheckIcon, ChevronsUpDownIcon, StarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useProviderOptions } from "@/features/providers/api";
import { formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/api";
import { useAssignProvider } from "./api";

// Searchable picker; professionals who offer one of the booked services are listed first.
export function AssignProviderPicker({
  booking,
  className,
  size = "default",
}: {
  booking: Pick<Booking, "id" | "serviceProviderId" | "services" | "serviceProvider">;
  className?: string;
  size?: "default" | "sm";
}) {
  const [open, setOpen] = useState(false);
  const { data: providers, isLoading } = useProviderOptions(open);
  const assign = useAssignProvider();

  const groups = useMemo(() => {
    const serviceIds = new Set(booking.services.map((s) => s.id));
    const usable = (providers ?? []).filter((p) => p.status !== "suspended" && p.status !== "inactive");
    const matching = usable.filter((p) => p.services?.some((s) => serviceIds.has(s.id)));
    const others = usable.filter((p) => !matching.includes(p));
    return { matching, others };
  }, [providers, booking.services]);

  const select = (providerId: string, name: string) => {
    if (providerId === booking.serviceProviderId) return setOpen(false);
    assign.mutate(
      { id: booking.id, providerId },
      {
        onSuccess: () => {
          toast.success(`Assigned to ${name}`);
          setOpen(false);
        },
      },
    );
  };

  const renderGroup = (heading: string, list: typeof groups.matching) =>
    list.length > 0 && (
      <CommandGroup heading={heading}>
        {list.map((p) => (
          <CommandItem key={p.id} value={`${p.name} ${p.phoneNumber} ${p.id}`} onSelect={() => select(p.id, p.name)}>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{p.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {formatPhone(p.phoneNumber)} · {p.services?.map((s) => s.name).join(", ") || "No services"}
              </span>
            </div>
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
              <StarIcon className="size-3 fill-warning text-warning" />
              {p.rating?.average ? p.rating.average.toFixed(1) : "—"}
            </span>
            <CheckIcon className={cn("ml-1", p.id === booking.serviceProviderId ? "opacity-100" : "opacity-0")} />
          </CommandItem>
        ))}
      </CommandGroup>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={booking.serviceProviderId ? "outline" : "default"}
          size={size}
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={assign.isPending}
        >
          {assign.isPending ? <Spinner data-icon="inline-start" /> : null}
          <span className="truncate">{booking.serviceProviderId ? "Reassign" : "Assign professional"}</span>
          <ChevronsUpDownIcon data-icon="inline-end" className="opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(24rem,calc(100vw-2rem))] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search by name or phone…" />
          <CommandList className="max-h-80">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Spinner /> Loading professionals…
              </div>
            ) : (
              <>
                <CommandEmpty>No professionals found.</CommandEmpty>
                {renderGroup("Offers this service", groups.matching)}
                {renderGroup("Other professionals", groups.others)}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
