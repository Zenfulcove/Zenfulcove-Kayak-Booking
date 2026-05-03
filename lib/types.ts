export type Kayak = {
  id: string;
  code: string | null;
  name: string;
  capacity: number;
  length_feet: number | null;
  daily_rate_cents: number;
  color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type Booking = {
  id: string;
  reference_code: string | null;
  kayak_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  stay_location: string | null;
  waiver_accepted_at: string | null;
  starts_at: string;
  ends_at: string;
  rate_type: "hourly" | "daily";
  amount_cents: number;
  status: BookingStatus;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingSuccess = {
  bookingId: string;
  referenceCode: string;
  lockboxCode: string | null;
  customerName: string;
  dateIso: string;
  kayak: Kayak;
  stayLocation: string;
};

export const STAY_OPTIONS = [
  "Sky Castle",
  "Fairy House",
  "Desert Rose",
  "Bird House",
] as const;
export type StayOption = (typeof STAY_OPTIONS)[number];

export const COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: "#dc2626", label: "Red" },
  { value: "#ea580c", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#16a34a", label: "Green" },
  { value: "#0d9488", label: "Teal" },
  { value: "#2563eb", label: "Blue" },
  { value: "#7c3aed", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
];

export function colorLabel(value: string): string {
  return COLOR_OPTIONS.find((c) => c.value === value)?.label ?? "Custom";
}

export function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
