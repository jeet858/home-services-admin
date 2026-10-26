"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useDebouncedValue } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";

export function TableToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className)}>{children}</div>;
}

// Debounced search box that keeps local input state while typing.
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(value ?? "");
  const debounced = useDebouncedValue(text);

  useEffect(() => setText(value ?? ""), [value]);
  useEffect(() => {
    if ((debounced || undefined) !== (value || undefined)) onChange(debounced || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <InputGroup className={cn("sm:w-72", className)}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} type="search" />
      {text && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" onClick={() => setText("")} aria-label="Clear search">
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
