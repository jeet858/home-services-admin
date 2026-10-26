"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { useServices, useSubservices } from "@/features/services/api";
import { cn } from "@/lib/utils";
import type { ServiceProvider, Weekday } from "@/types/api";

export const WEEKDAYS: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const optionalPattern = (re: RegExp, message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || re.test(v), message);

const daySchema = z.object({ available: z.boolean(), start: z.string(), end: z.string() });

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email("Enter a valid email"),
  phoneNumber: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit mobile number"),
  address: z.string().trim().max(300),
  qualification: z.string().trim().max(120),
  services: z.array(z.string()),
  subservices: z.array(z.string()),
  specializations: z.string(),
  experience: z.number().min(0, "Can't be negative").or(z.nan()),
  experienceUnit: z.enum(["months", "years"]),
  commission: z.number().min(0).max(100, "Must be 0–100").or(z.nan()),
  availability: z.record(z.string(), daySchema),
  aadhaarNumber: optionalPattern(/^\d{12}$/, "Aadhaar has 12 digits"),
  panNumber: optionalPattern(/^[A-Z]{5}\d{4}[A-Z]$/, "PAN looks like ABCDE1234F"),
  bankAccountHolderName: z.string().trim(),
  bankAccountNumber: optionalPattern(/^\d{9,18}$/, "9–18 digits"),
  bankIfscCode: optionalPattern(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC looks like SBIN0001234"),
  bankName: z.string().trim(),
  notes: z.string().max(500, "Max 500 characters"),
});

type Values = z.infer<typeof schema>;

function toValues(p?: ServiceProvider): Values {
  return {
    name: p?.name ?? "",
    email: p?.email ?? "",
    phoneNumber: p?.phoneNumber?.replace(/\D/g, "").slice(-10) ?? "",
    address: p?.address ?? "",
    qualification: p?.qualification ?? "",
    services: p?.services?.map((s) => s.id) ?? [],
    subservices: p?.subservices?.map((s) => s.id) ?? [],
    specializations: p?.specializations?.join(", ") ?? "",
    experience: p?.experience ?? Number.NaN,
    experienceUnit: p?.experienceUnit ?? "years",
    commission: p?.commission ?? 10,
    availability: Object.fromEntries(
      WEEKDAYS.map((d) => {
        const day = p?.availability?.[d];
        return [d, { available: day?.available ?? true, start: day?.start ?? "09:00", end: day?.end ?? "19:00" }];
      }),
    ),
    aadhaarNumber: p?.aadhaarCard?.number ?? "",
    panNumber: p?.panCard?.number ?? "",
    bankAccountHolderName: p?.bankDetails?.accountHolderName ?? "",
    bankAccountNumber: p?.bankDetails?.accountNumber ?? "",
    bankIfscCode: p?.bankDetails?.ifscCode ?? "",
    bankName: p?.bankDetails?.bankName ?? "",
    notes: p?.notes ?? "",
  };
}

type Files = { aadhaarCardImage: File | null; panCardImage: File | null; passportPhoto: File | null };

// Multipart body: nested values travel as JSON strings, which the backend parses.
function toFormData(values: Values, files: Files, initial: Values, isEdit: boolean) {
  const fd = new FormData();
  const put = (key: string, value: string) => fd.append(key, value);

  put("name", values.name);
  put("email", values.email);
  put("phoneNumber", values.phoneNumber);
  if (values.address || isEdit) put("address", values.address);
  if (values.qualification || isEdit) put("qualification", values.qualification);
  put("services", JSON.stringify(values.services));
  put("subservices", JSON.stringify(values.subservices));
  put(
    "specializations",
    JSON.stringify(
      values.specializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
  if (!Number.isNaN(values.experience)) put("experience", String(values.experience));
  put("experienceUnit", values.experienceUnit);
  if (!Number.isNaN(values.commission)) put("commission", String(values.commission));
  put("availability", JSON.stringify(values.availability));
  if (values.notes || isEdit) put("notes", values.notes);

  // Re-sending an unchanged card number would reset its verified flag, so only send changes.
  if (values.aadhaarNumber && values.aadhaarNumber !== initial.aadhaarNumber) put("aadhaarCard", values.aadhaarNumber);
  if (values.panNumber && values.panNumber !== initial.panNumber) put("panCard", values.panNumber);

  const bank = {
    accountHolderName: values.bankAccountHolderName,
    accountNumber: values.bankAccountNumber,
    ifscCode: values.bankIfscCode,
    bankName: values.bankName,
  };
  if (Object.values(bank).some(Boolean)) put("bankDetails", JSON.stringify(bank));

  for (const [key, file] of Object.entries(files)) if (file) fd.append(key, file);
  return fd;
}

export function ProviderForm({
  provider,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  provider?: ServiceProvider;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (body: FormData) => void;
  onCancel?: () => void;
}) {
  const initial = useMemo(() => toValues(provider), [provider]);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });
  const [files, setFiles] = useState<Files>({ aadhaarCardImage: null, panCardImage: null, passportPhoto: null });
  const { data: services } = useServices();
  const { data: subservices } = useSubservices();
  const selectedServices = useWatch({ control: form.control, name: "services" });

  const availableSubs = useMemo(
    () => (subservices ?? []).filter((s) => selectedServices.includes(s.serviceId)),
    [subservices, selectedServices],
  );

  const text = (name: keyof Values, label: string, props: React.ComponentProps<typeof Input> = {}, description?: string) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            {...props}
            value={field.value as string}
            onChange={(e) => field.onChange(props.className?.includes("uppercase") ? e.target.value.toUpperCase() : e.target.value)}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.error ? <FieldError errors={[fieldState.error]} /> : description && <FieldDescription>{description}</FieldDescription>}
        </Field>
      )}
    />
  );

  const submit = (values: Values) => onSubmit(toFormData(values, files, initial, Boolean(provider)));

  return (
    <form
      onSubmit={form.handleSubmit(submit, () => toast.error("Please fix the highlighted fields"))}
      className="grid gap-4 lg:grid-cols-3 lg:gap-6"
      noValidate
    >
      <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {text("name", "Full name", { autoComplete: "off" })}
              <div className="grid gap-4 sm:grid-cols-2">
                {text("phoneNumber", "Mobile number", { inputMode: "numeric", maxLength: 10, placeholder: "98XXXXXXXX" })}
                {text("email", "Email", { type: "email" })}
              </div>
              {text("address", "Address")}
              {text("qualification", "Qualification", { placeholder: "e.g. ITI Electrician" })}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work</CardTitle>
            <CardDescription>What they do — used to suggest them when assigning bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="services"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Services</FieldLabel>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      spacing={2}
                      className="flex-wrap justify-start"
                      value={field.value}
                      onValueChange={(next) => {
                        field.onChange(next);
                        // Drop sub-services whose parent was deselected.
                        const allowed = new Set((subservices ?? []).filter((s) => next.includes(s.serviceId)).map((s) => s.id));
                        form.setValue(
                          "subservices",
                          form.getValues("subservices").filter((id) => allowed.has(id)),
                        );
                      }}
                    >
                      {(services ?? []).map((s) => (
                        <ToggleGroupItem key={s.id} value={s.id} className="data-[state=on]:border-primary data-[state=on]:bg-primary-soft data-[state=on]:text-primary-soft-foreground">
                          {s.name}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="subservices"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Sub-services</FieldLabel>
                    {availableSubs.length === 0 ? (
                      <FieldDescription>Select a service to choose specific sub-services.</FieldDescription>
                    ) : (
                      <ToggleGroup
                        type="multiple"
                        variant="outline"
                        size="sm"
                        spacing={2}
                        className="flex-wrap justify-start"
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        {availableSubs.map((s) => (
                          <ToggleGroupItem key={s.id} value={s.id} className="data-[state=on]:border-primary data-[state=on]:bg-primary-soft data-[state=on]:text-primary-soft-foreground">
                            {s.name}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )}
                  </Field>
                )}
              />
              {text("specializations", "Specializations", { placeholder: "AC repair, Wiring, Inverter" }, "Comma-separated")}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="experience">Experience</FieldLabel>
                  <div className="flex gap-2">
                    <Controller
                      control={form.control}
                      name="experience"
                      render={({ field, fieldState }) => (
                        <Input
                          id="experience"
                          type="number"
                          min={0}
                          value={Number.isNaN(field.value) ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          aria-invalid={fieldState.invalid}
                        />
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="experienceUnit"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="years">Years</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </Field>
                <Controller
                  control={form.control}
                  name="commission"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="commission">Platform commission</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="commission"
                          type="number"
                          min={0}
                          max={100}
                          value={Number.isNaN(field.value) ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          aria-invalid={fieldState.invalid}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>%</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly availability</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {WEEKDAYS.map((day) => (
              <Controller
                key={day}
                control={form.control}
                name={`availability.${day}`}
                render={({ field }) => (
                  <div className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <label className="flex w-36 items-center gap-3 text-sm font-medium capitalize">
                      <Switch
                        checked={field.value.available}
                        onCheckedChange={(available) => field.onChange({ ...field.value, available })}
                      />
                      {day}
                    </label>
                    <div className={cn("flex items-center gap-2 text-sm", !field.value.available && "pointer-events-none opacity-40")}>
                      <Input
                        type="time"
                        className="w-28"
                        value={field.value.start}
                        onChange={(e) => field.onChange({ ...field.value, start: e.target.value })}
                        aria-label={`${day} start`}
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        className="w-28"
                        value={field.value.end}
                        onChange={(e) => field.onChange({ ...field.value, end: e.target.value })}
                        aria-label={`${day} end`}
                      />
                    </div>
                  </div>
                )}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank details</CardTitle>
            <CardDescription>For payouts. Optional.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                {text("bankAccountHolderName", "Account holder")}
                {text("bankName", "Bank")}
                {text("bankAccountNumber", "Account number", { inputMode: "numeric" })}
                {text("bankIfscCode", "IFSC", { className: "uppercase" })}
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Identity (KYC)</CardTitle>
            <CardDescription>Changing a number or image resets its verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FileDropzone
                label="Passport photo"
                file={files.passportPhoto}
                existingUrl={provider?.passportPhoto}
                onChange={(f) => setFiles((s) => ({ ...s, passportPhoto: f }))}
                onError={toast.error}
              />
              {text("aadhaarNumber", "Aadhaar number", { inputMode: "numeric", maxLength: 12 })}
              <FileDropzone
                label="Aadhaar card image"
                file={files.aadhaarCardImage}
                existingUrl={provider?.aadhaarCard?.image}
                onChange={(f) => setFiles((s) => ({ ...s, aadhaarCardImage: f }))}
                onError={toast.error}
              />
              {text("panNumber", "PAN", { maxLength: 10, className: "uppercase" })}
              <FileDropzone
                label="PAN card image"
                file={files.panCardImage}
                existingUrl={provider?.panCard?.image}
                onChange={(f) => setFiles((s) => ({ ...s, panCardImage: f }))}
                onError={toast.error}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={form.control}
              name="notes"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea {...field} rows={4} placeholder="Only visible to admins" aria-label="Internal notes" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
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
