import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn("size-3.5", i < Math.round(value) ? "fill-warning text-warning" : "fill-muted text-muted")}
        />
      ))}
    </span>
  );
}

export function PersonAvatar({
  name,
  src,
  className,
}: {
  name: string | null | undefined;
  src?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt={name ?? ""} className="object-cover" />}
      <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary-soft-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function DescriptionList({ items, className }: { items: { label: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[minmax(0,10rem)_1fr]", className)}>
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 font-medium break-words">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Price({ original, discounted }: { original: number; discounted: number }) {
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  return (
    <span className="inline-flex items-baseline gap-1.5 tabular-nums">
      <span className="font-semibold">{fmt(discounted)}</span>
      {original > discounted && <span className="text-xs text-muted-foreground line-through">{fmt(original)}</span>}
    </span>
  );
}
