"use client";

import { UploadIcon, XIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024; // backend multer limit

export function FileDropzone({
  label,
  file,
  existingUrl,
  onChange,
  onError,
  className,
}: {
  label: string;
  file: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  onError?: (message: string) => void;
  className?: string;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const accept = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!ACCEPT.split(",").includes(candidate.type)) return onError?.("Only JPEG, PNG or WebP images are allowed");
    if (candidate.size > MAX_BYTES) return onError?.("Images must be 5 MB or smaller");
    onChange(candidate);
  };

  const shown = preview ?? existingUrl ?? null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium">{label}</span>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed bg-muted/40 p-4 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/40",
          dragging && "border-primary bg-accent/60",
        )}
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt={label} className="absolute inset-0 size-full object-cover" />
        ) : (
          <>
            <UploadIcon className="size-5" />
            <span>
              <span className="font-medium text-foreground">Click to upload</span> or drag an image
            </span>
            <span className="text-xs">JPEG, PNG or WebP · up to 5 MB</span>
          </>
        )}
        <input
          id={id}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {file && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{file.name}</span>
          <Button type="button" variant="ghost" size="icon-xs" onClick={() => onChange(null)} aria-label={`Remove ${label}`}>
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
