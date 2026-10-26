"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { Booking } from "@/types/api";
import { useUpdateBooking } from "./api";

const schema = z.object({
  date: z.date({ error: "Pick a date" }),
  time: z.string().trim().min(1, "Time is required"),
  discount: z.number({ error: "Enter an amount" }).min(0),
  finalPrice: z.number({ error: "Enter an amount" }).min(0),
  notes: z.string().max(1000),
});
type Values = z.infer<typeof schema>;

const toValues = (b: Booking): Values => ({
  date: new Date(b.date),
  time: b.time,
  discount: b.discount,
  finalPrice: b.finalPrice,
  notes: b.notes ?? "",
});

export function EditBookingSheet({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateBooking();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(booking) });

  useEffect(() => {
    if (open) form.reset(toValues(booking));
  }, [open, booking, form]);

  const onSubmit = (values: Values) =>
    update.mutate(
      { id: booking.id, ...values, date: values.date.toISOString() },
      {
        onSuccess: () => {
          toast.success("Booking updated");
          onOpenChange(false);
        },
      },
    );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit booking</SheetTitle>
          <SheetDescription>Reschedule or adjust pricing. The customer sees these changes in the app.</SheetDescription>
        </SheetHeader>
        <form id="edit-booking" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="date"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start font-normal">
                          <CalendarIcon data-icon="inline-start" />
                          {field.value ? format(field.value, "d MMM yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={(d) => d && field.onChange(d)} defaultMonth={field.value} />
                      </PopoverContent>
                    </Popover>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="time"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="time">Time slot</FieldLabel>
                    <Input {...field} id="time" placeholder="10:00 AM" aria-invalid={fieldState.invalid} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["discount", "finalPrice"] as const).map((name) => (
                <Controller
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={name}>{name === "discount" ? "Discount (₹)" : "Final price (₹)"}</FieldLabel>
                      <Input
                        id={name}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              ))}
            </div>
            <FieldDescription className="-mt-3">Final price includes the ₹49 safety fee.</FieldDescription>
            <Controller
              control={form.control}
              name="notes"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="notes">Notes for the professional</FieldLabel>
                  <Textarea {...field} id="notes" rows={4} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <SheetFooter>
          <Button type="submit" form="edit-booking" disabled={update.isPending}>
            {update.isPending && <Spinner data-icon="inline-start" />}
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
