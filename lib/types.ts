export type Kayak = {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  hourly_rate_cents: number;
  daily_rate_cents: number;
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
  kayak_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
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

export function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
  });
}
