"use client";

import { RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReloadButton() {
  return (
    <Button onClick={() => window.location.reload()}>
      <RotateCwIcon data-icon="inline-start" />
      Try again
    </Button>
  );
}
