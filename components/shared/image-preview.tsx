"use client";

import { ImageIcon, ImageOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Plain <img> so any admin-entered URL renders without next/image host config.
export function Thumb({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <div className={cn("flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground", className)}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" onError={() => setFailed(true)} />
      ) : src ? (
        <ImageOffIcon className="size-4" />
      ) : (
        <ImageIcon className="size-4" />
      )}
    </div>
  );
}

export function Lightbox({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl p-2 sm:max-w-3xl">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-h-[80svh] w-full rounded-lg object-contain" />
      </DialogContent>
    </Dialog>
  );
}
