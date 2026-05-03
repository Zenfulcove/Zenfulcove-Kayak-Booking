import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { STAY_OPTIONS } from "@/lib/types";

type BookingPayload = {
  kayakId: string;
  dateIso: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  stayLocation: string;
  waiverAccepted: boolean;
};

const validStays = new Set<string>(STAY_OPTIONS);

// Avoid easily-confused chars (0, 1, I, O).
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateReferenceCode(length = 6): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += REFERENCE_ALPHABET[bytes[i] % REFERENCE_ALPHABET.length];
  }
  return code;
}

function isValidPayload(p: Partial<BookingPayload>): p is BookingPayload {
  if (typeof p.kayakId !== "string") return false;
  if (typeof p.dateIso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(p.dateIso)) {
    return false;
  }
  if (
    typeof p.customerName !== "string" ||
    p.customerName.trim().length === 0
  ) {
    return false;
  }
  if (typeof p.stayLocation !== "string" || !validStays.has(p.stayLocation)) {
    return false;
  }
  if (p.waiverAccepted !== true) return false;
  if (p.customerEmail !== null && p.customerEmail !== undefined) {
    if (
      typeof p.customerEmail !== "string" ||
      !/.+@.+\..+/.test(p.customerEmail)
    ) {
      return false;
    }
  }
  if (p.customerPhone !== null && p.customerPhone !== undefined) {
    if (typeof p.customerPhone !== "string") return false;
  }
  return true;
}

export async function POST(req: Request) {
  let body: Partial<BookingPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 400 }
    );
  }

  const start = new Date(`${body.dateIso}T09:00:00`);
  const end = new Date(`${body.dateIso}T17:00:00`);
  if (!isFinite(start.getTime()) || !isFinite(end.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: kayak, error: kayakError } = await supabase
    .from("kayaks")
    .select("id, code, daily_rate_cents, is_active")
    .eq("id", body.kayakId)
    .maybeSingle();

  if (kayakError || !kayak || !kayak.is_active) {
    return NextResponse.json({ error: "Kayak not available" }, { status: 404 });
  }

  // Try a few reference codes in case of (extremely unlikely) collision.
  let inserted: { id: string; reference_code: string } | null = null;
  let lastError: { code?: string; message: string } | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const referenceCode = generateReferenceCode();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        reference_code: referenceCode,
        kayak_id: kayak.id,
        customer_name: body.customerName.trim(),
        customer_email: body.customerEmail
          ? body.customerEmail.trim().toLowerCase()
          : null,
        customer_phone: body.customerPhone ? body.customerPhone.trim() : null,
        stay_location: body.stayLocation,
        waiver_accepted_at: new Date().toISOString(),
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        rate_type: "daily",
        amount_cents: kayak.daily_rate_cents,
        status: "pending",
      })
      .select("id, reference_code")
      .single();

    if (!error) {
      inserted = data as { id: string; reference_code: string };
      break;
    }
    if (error.code === "23P01") {
      return NextResponse.json(
        { error: "That kayak is already booked for this day." },
        { status: 409 }
      );
    }
    if (
      error.code === "23505" &&
      (error.message ?? "").toLowerCase().includes("reference_code")
    ) {
      // Collision on reference_code — try again with a new one.
      lastError = error;
      continue;
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!inserted) {
    return NextResponse.json(
      { error: lastError?.message ?? "Could not generate booking reference." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    bookingId: inserted.id,
    referenceCode: inserted.reference_code,
    lockboxCode: kayak.code ?? null,
  });
}
