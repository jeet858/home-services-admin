"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Thumb } from "@/components/shared/image-preview";
import type { Service } from "@/types/api";
import type { CatalogueInput } from "./api";

const schema = z
  .object({
    serviceId: z.string().optional(),
    name: z.string().trim().min(2, "Name is required").max(120),
    description: z.string().trim().max(2000),
    process: z.string().trim().max(4000),
    originalPrice: z.number({ error: "Enter a price" }).min(0, "Price can't be negative"),
    discountedPrice: z.number({ error: "Enter a price" }).min(0, "Price can't be negative"),
    duration: z.string().trim().min(1, "Duration is required").max(40),
    image: z.union([z.literal(""), z.url("Enter a full image URL (https://…)")]),
  })
  .refine((v) => v.discountedPrice <= v.originalPrice, {
    path: ["discountedPrice"],
    message: "Selling price can't exceed the original price",
  });

export type CatalogueValues = z.infer<typeof schema>;

export function toCatalogueInput(values: CatalogueValues): CatalogueInput {
  return {
    name: values.name,
    description: values.description || undefined,
    process: values.process || undefined,
    originalPrice: values.originalPrice,
    discountedPrice: values.discountedPrice,
    duration: values.duration,
    image: values.image || undefined,
  };
}

export function CatalogueForm({
  kind,
  defaultValues,
  services,
  lockService,
  lockImage,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  kind: "service" | "subservice";
  defaultValues?: Partial<CatalogueValues>;
  services?: Service[];
  lockService?: boolean;
  lockImage?: boolean;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: CatalogueValues) => void;
  onCancel?: () => void;
}) {
  const form = useForm<CatalogueValues>({
    resolver: zodResolver(
      kind === "subservice"
        ? schema.refine((v) => Boolean(v.serviceId), { path: ["serviceId"], message: "Choose a parent service" })
        : schema,
    ),
    defaultValues: {
      serviceId: "",
      name: "",
      description: "",
      process: "",
      originalPrice: Number.NaN,
      discountedPrice: Number.NaN,
      duration: "",
      image: "",
      ...defaultValues,
    },
  });

  const [image, original, discounted] = useWatch({ control: form.control, name: ["image", "originalPrice", "discountedPrice"] });
  const savings = original > 0 && discounted >= 0 && discounted < original ? Math.round(((original - discounted) / original) * 100) : 0;

  const priceField = (name: "originalPrice" | "discountedPrice", label: string, description: string) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>₹</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={name}
              type="number"
              inputMode="decimal"
              min={0}
              value={Number.isNaN(field.value) ? "" : field.value}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
            />
          </InputGroup>
          {fieldState.error ? <FieldError errors={[fieldState.error]} /> : <FieldDescription>{description}</FieldDescription>}
        </Field>
      )}
    />
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-3 lg:gap-6" noValidate>
      <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              {kind === "service" ? "Shown as a category on the app's home screen." : "A bookable item customers add to their cart."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {kind === "subservice" && (
                <Controller
                  control={form.control}
                  name="serviceId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Parent service</FieldLabel>
                      <Select value={field.value || undefined} onValueChange={field.onChange} disabled={lockService}>
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Choose a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {(services ?? []).map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {lockService && <FieldDescription>The parent service can&apos;t be changed after creation.</FieldDescription>}
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              )}
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      placeholder={kind === "service" ? "e.g. Cleaning" : "e.g. Full home deep cleaning"}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea {...field} id="description" rows={3} placeholder="What's included, in a sentence or two." />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="process"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="process">How it works</FieldLabel>
                    <Textarea {...field} id="process" rows={5} placeholder={"Inspection of the area\nDeep cleaning with eco-safe products\nFinal walkthrough"} />
                    <FieldDescription>One step per line — shown as a checklist in the app.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            {savings > 0 && <CardDescription className="text-success">Customers save {savings}%</CardDescription>}
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {priceField("originalPrice", "Original price", "Shown struck-through (MRP).")}
              {priceField("discountedPrice", "Selling price", "What the customer pays.")}
              <Controller
                control={form.control}
                name="duration"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="duration">Duration</FieldLabel>
                    <Input {...field} id="duration" placeholder="e.g. 2 hrs" aria-invalid={fieldState.invalid} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Thumb src={image || null} alt="Preview" className="aspect-video size-auto w-full rounded-xl" />
            <Controller
              control={form.control}
              name="image"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="image" className="sr-only">
                    Image URL
                  </FieldLabel>
                  <Input {...field} id="image" type="url" placeholder="https://…" disabled={lockImage} aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            {lockImage && (
              <p className="flex gap-2 text-xs text-muted-foreground">
                <InfoIcon className="size-3.5 shrink-0" />
                The API doesn&apos;t allow changing a sub-service image after it&apos;s created.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2 lg:sticky lg:bottom-4">
          {onCancel && (
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
