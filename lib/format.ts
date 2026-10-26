import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

// Flat fee added at checkout in the mobile app (kSafetyFee).
export const SAFETY_FEE = 49;

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inrPrecise = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

export function formatCurrency(value: number | null | undefined, precise = false) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return (precise ? inrPrecise : inr).format(value);
}

export function formatCompact(value: number) {
  return compact.format(value);
}

function toDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const d = typeof value === "string" ? parseISO(value) : value;
  return isValid(d) ? d : null;
}

export function formatDate(value: string | Date | null | undefined, pattern = "d MMM yyyy") {
  const d = toDate(value);
  return d ? format(d, pattern) : "—";
}

export function formatDateTime(value: string | Date | null | undefined) {
  return formatDate(value, "d MMM yyyy, h:mm a");
}

export function formatRelative(value: string | Date | null | undefined) {
  const d = toDate(value);
  return d ? `${formatDistanceToNowStrict(d)} ago` : "—";
}

export function formatPhone(phone: string | null | undefined) {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}

export function shortId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function formatAddress(a: {
  houseNo?: string | null;
  street?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  fullAddress?: string | null;
} | null | undefined) {
  if (!a) return "—";
  if (a.fullAddress) return a.fullAddress;
  return [a.houseNo, a.street, a.landmark, a.city, a.state, a.zip].filter(Boolean).join(", ");
}
