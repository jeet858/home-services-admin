"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { useStartBooking } from "./api";

export function StartServiceDialog({
  bookingId,
  open,
  onOpenChange,
}: {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [otp, setOtp] = useState("");
  const start = useStartBooking();

  const submit = () =>
    start.mutate(
      { id: bookingId, otp },
      {
        onSuccess: () => {
          toast.success("Service started");
          setOtp("");
          onOpenChange(false);
        },
      },
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setOtp("");
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Start service</DialogTitle>
          <DialogDescription>Enter the 4-digit OTP the customer shared with the professional.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col items-center gap-6 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (otp.length === 4) submit();
          }}
        >
          <InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS} value={otp} onChange={setOtp} autoFocus>
            <InputOTPGroup>
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot key={i} index={i} className="size-12 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <DialogFooter className="w-full">
            <Button type="submit" className="w-full" disabled={otp.length !== 4 || start.isPending}>
              {start.isPending && <Spinner data-icon="inline-start" />}
              Verify & start
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
