import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

type BookingPayload = {
  kayakId: string;
  startsAt: string;
  endsAt: string;
  rateType: "hourly" | "daily";
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
};

function isValidPayload(p: Partial<BookingPayload>): p is BookingPayload {
  return (
    typeof p.kayakId === "string" &&
    typeof p.startsAt === "string" &&
    typeof p.endsAt === "string" &&
    (p.rateType === "hourly" || p.rateType === "daily") &&
    typeof p.customerName === "string" &&
    p.customerName.trim().length > 0 &&
    typeof p.customerEmail === "string" &&
    /.+@.+\..+/.test(p.customerEmail)
  );
}

export async function POST(req: Request) {
  let body: Partial<BookingPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const start = new Date(body.startsAt);
  const end = new Date(body.endsAt);
  if (!isFinite(start.getTime()) || !isFinite(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: kayak, error: kayakError } = await supabase
    .from("kayaks")
    .select("id, hourly_rate_cents, daily_rate_cents, is_active")
    .eq("id", body.kayakId)
    .maybeSingle();

  if (kayakError || !kayak || !kayak.is_active) {
    return NextResponse.json({ error: "Kayak not available" }, { status: 404 });
  }

  const ms = end.getTime() - start.getTime();
  const amountCents =
    body.rateType === "hourly"
      ? Math.ceil(ms / (1000 * 60 * 60)) * kayak.hourly_rate_cents
      : Math.ceil(ms / (1000 * 60 * 60 * 24)) * kayak.daily_rate_cents;

  const { data: inserted, error: insertError } = await supabase
    .from("bookings")
    .insert({
      kayak_id: kayak.id,
      customer_name: body.customerName.trim(),
      customer_email: body.customerEmail.trim().toLowerCase(),
      customer_phone: body.customerPhone,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      rate_type: body.rateType,
      amount_cents: amountCents,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    // 23P01 is the exclusion-constraint violation (overlapping booking).
    if (insertError.code === "23P01") {
      return NextResponse.json(
        { error: "That time slot is already booked." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // TODO: create Stripe Checkout session here and return its URL once payments
  // are wired up. For now, the client redirects to a confirmation page.
  return NextResponse.json({ bookingId: inserted.id });
}
