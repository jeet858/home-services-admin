"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Coupon } from "@/types/api";
import { type CouponInput, useCreateCoupon, useUpdateCoupon } from "./api";

const optionalNumber = z.number().min(0, "Can't be negative").or(z.nan());

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "At least 3 characters")
      .max(20)
      .regex(/^[A-Z0-9_-]+$/, "Letters, numbers, - and _ only"),
    title: z.string().trim().min(2, "Title is required").max(80),
    description: z.string().trim().max(300),
    tag: z.string().trim().max(24),
    type: z.enum(["percent", "flat", "cashback"]),
    value: z.number({ error: "Enter a value" }).positive("Must be more than 0"),
    maxDiscount: optionalNumber,
    minOrder: optionalNumber,
    perUserLimit: z.number().int("Whole number").min(1, "At least 1").or(z.nan()),
    validTill: z.date().nullable(),
    active: z.boolean(),
  })
  .refine((v) => v.type !== "percent" || v.value <= 100, { path: ["value"], message: "Percent can't exceed 100" });

type Values = z.infer<typeof schema>;

const toValues = (c?: Coupon | null): Values => ({
  code: c?.code ?? "",
  title: c?.title ?? "",
  description: c?.description ?? "",
  tag: c?.tag ?? "",
  type: c?.type ?? "percent",
  value: c?.value ?? Number.NaN,
  maxDiscount: c?.maxDiscount ?? Number.NaN,
  minOrder: c?.minOrder ?? Number.NaN,
  perUserLimit: c?.perUserLimit ?? Number.NaN,
  validTill: c?.validTill ? new Date(c.validTill) : null,
  active: c?.active ?? true,
});

const numOrNull = (n: number) => (Number.isNaN(n) ? null : n);

function toInput(v: Values): CouponInput {
  return {
    code: v.code,
    title: v.title,
    description: v.description || null,
    tag: v.tag || null,
    type: v.type,
    value: v.value,
    maxDiscount: numOrNull(v.maxDiscount),
    minOrder: Number.isNaN(v.minOrder) ? 0 : v.minOrder,
    perUserLimit: numOrNull(v.perUserLimit),
    validTill: v.validTill ? v.validTill.toISOString() : null,
    active: v.active,
  };
}

export function CouponSheet({
  coupon,
  open,
  onOpenChange,
}: {
  coupon: Coupon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(coupon) });
  const type = useWatch({ control: form.control, name: "type" });
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) form.reset(toValues(coupon));
  }, [open, coupon, form]);

  const onSubmit = (values: Values) => {
    const done = () => {
      toast.success(coupon ? "Coupon updated" : `${values.code} created`);
      onOpenChange(false);
    };
    if (coupon) update.mutate({ id: coupon.id, ...toInput(values) }, { onSuccess: done });
    else create.mutate(toInput(values), { onSuccess: done });
  };

  const numberField = (name: "value" | "maxDiscount" | "minOrder" | "perUserLimit", label: string, description?: string) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            type="number"
            min={0}
            value={Number.isNaN(field.value) ? "" : field.value}
            onChange={(e) => field.onChange(e.target.valueAsNumber)}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.error ? <FieldError errors={[fieldState.error]} /> : description && <FieldDescription>{description}</FieldDescription>}
        </Field>
      )}
    />
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{coupon ? `Edit ${coupon.code}` : "New coupon"}</SheetTitle>
          <SheetDescription>Active coupons appear on the Offers screen and can be applied at checkout.</SheetDescription>
        </SheetHeader>
        <form id="coupon-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4" noValidate>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="code"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="code">Code</FieldLabel>
                    <Input
                      {...field}
                      id="code"
                      className="font-mono uppercase"
                      placeholder="WELCOME100"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/\s/g, ""))}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="tag">Tag</FieldLabel>
                    <Input {...field} id="tag" placeholder="New users" />
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input {...field} id="title" placeholder="₹100 off your first booking" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea {...field} id="description" rows={2} />
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Type</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percent off</SelectItem>
                        <SelectItem value="flat">Flat ₹ off</SelectItem>
                        <SelectItem value="cashback">Cashback</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              {numberField("value", type === "percent" ? "Value (%)" : "Value (₹)")}
            </div>
            {type === "cashback" && (
              <FieldDescription className="-mt-3">Cashback doesn&apos;t reduce the bill — it&apos;s credited after the job.</FieldDescription>
            )}
            <div className="grid grid-cols-2 gap-3">
              {numberField("maxDiscount", "Max discount (₹)", "Leave empty for no cap")}
              {numberField("minOrder", "Min order (₹)")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {numberField("perUserLimit", "Uses per customer", "Leave empty for unlimited")}
              <Controller
                control={form.control}
                name="validTill"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Valid till</FieldLabel>
                    <div className="flex">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={`flex-1 justify-start font-normal ${field.value ? "rounded-r-none" : "text-muted-foreground"}`}
                          >
                            <CalendarIcon data-icon="inline-start" />
                            {field.value ? format(field.value, "d MMM yyyy") : "No expiry"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={(d) => field.onChange(d ? new Date(d.setHours(23, 59, 59, 999)) : null)}
                            disabled={{ before: new Date() }}
                          />
                        </PopoverContent>
                      </Popover>
                      {field.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-l-none border-l-0"
                          onClick={() => field.onChange(null)}
                          aria-label="Clear expiry"
                        >
                          <XIcon />
                        </Button>
                      )}
                    </div>
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <Field orientation="horizontal" className="rounded-xl border p-3">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <FieldLabel htmlFor="active">Active</FieldLabel>
                    <FieldDescription>Inactive coupons are hidden and can&apos;t be applied.</FieldDescription>
                  </div>
                  <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <SheetFooter>
          <Button type="submit" form="coupon-form" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {coupon ? "Save changes" : "Create coupon"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
