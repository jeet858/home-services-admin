"use client";

import { endOfDay, format, startOfDay } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangeFilter({
  from,
  to,
  onChange,
  placeholder = "Any date",
}: {
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
  placeholder?: string;
}) {
  const selected: DateRange | undefined = from ? { from: new Date(from), to: to ? new Date(to) : undefined } : undefined;
  const label = selected?.from
    ? selected.to && format(selected.to, "d MMM") !== format(selected.from, "d MMM")
      ? `${format(selected.from, "d MMM")} – ${format(selected.to, "d MMM yyyy")}`
      : format(selected.from, "d MMM yyyy")
    : placeholder;

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("justify-start font-normal", !selected && "text-muted-foreground", selected && "rounded-r-none")}>
            <CalendarIcon data-icon="inline-start" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            numberOfMonths={1}
            selected={selected}
            defaultMonth={selected?.from}
            onSelect={(range) =>
              onChange({
                from: range?.from ? startOfDay(range.from).toISOString() : undefined,
                to: range?.from ? endOfDay(range.to ?? range.from).toISOString() : undefined,
              })
            }
          />
        </PopoverContent>
      </Popover>
      {selected && (
        <Button variant="outline" size="icon" className="rounded-l-none border-l-0" onClick={() => onChange({})} aria-label="Clear dates">
          <XIcon />
        </Button>
      )}
    </div>
  );
}
