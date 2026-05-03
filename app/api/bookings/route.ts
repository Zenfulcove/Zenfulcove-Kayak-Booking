import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { PROPERTY_TO_CABIN } from "@/lib/types";
import { propertyTimeToUtc, todayIso } from "@/lib/dates";
import { fetchReservationById, LodgifyError } from "@/lib/lodgify";

type BookingPayload = {
  kayakId: string;
  dateIso: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  reservationId: string;
  waiverAccepted: boolean;
};

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
  if (
    typeof p.reservationId !== "string" ||
    p.reservationId.trim().length === 0
  ) {
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

function isoLessOrEqual(a: string, b: string): boolean {
  return a <= b;
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

  // 1. Validate the Lodgify reservation.
  let reservation;
  try {
    reservation = await fetchReservationById(body.reservationId);
  } catch (err) {
    const detail = err instanceof LodgifyError ? err.detail : String(err);
    return NextResponse.json(
      { error: `Couldn't reach Lodgify (${detail.slice(0, 120)})` },
      { status: 502 }
    );
  }

  if (!reservation) {
    return NextResponse.json(
      {
        error:
          "We couldn't find that reservation. Double-check the booking number on your confirmation email.",
      },
      { status: 404 }
    );
  }

  const cabin = PROPERTY_TO_CABIN[reservation.propertyId];
  if (!cabin) {
    return NextResponse.json(
      { error: "That reservation isn't for one of our cabins." },
      { status: 400 }
    );
  }

  // 2. Reservation must not have ended already (in property timezone).
  const today = todayIso();
  if (reservation.departureIso < today) {
    return NextResponse.json(
      { error: "That reservation has already ended." },
      { status: 400 }
    );
  }

  // 3. Kayak date must fall within the stay window:
  //    arrival ≤ kayak date < departure.
  if (
    !isoLessOrEqual(reservation.arrivalIso, body.dateIso) ||
    !isoLessOrEqual(body.dateIso, reservation.departureIso)
  ) {
    return NextResponse.json(
      {
        error: `Pick a date between ${reservation.arrivalIso} and ${reservation.departureIso}.`,
      },
      { status: 400 }
    );
  }

  // 4. Validate kayak exists and is active.
  const supabase = createSupabaseAdminClient();
  const { data: kayak, error: kayakError } = await supabase
    .from("kayaks")
    .select("id, code, daily_rate_cents, is_active")
    .eq("id", body.kayakId)
    .maybeSingle();

  if (kayakError || !kayak || !kayak.is_active) {
    return NextResponse.json({ error: "Kayak not available" }, { status: 404 });
  }

  // 5. Determine if this is the guest's free kayak (1 complimentary per
  //    Lodgify reservation; subsequent bookings are paid).
  const { count: existingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("lodgify_reservation_id", reservation.id)
    .in("status", ["pending", "confirmed", "completed"]);

  const isComplimentary = (existingCount ?? 0) === 0;
  const amountCents = isComplimentary ? 0 : kayak.daily_rate_cents;
  const status = isComplimentary ? "confirmed" : "pending";

  // 6. Compute UTC moments for the booking day in Austin.
  const start = propertyTimeToUtc(body.dateIso, 9, 0);
  const end = propertyTimeToUtc(body.dateIso, 17, 0);

  // 7. Insert with retry on reference_code collision (very rare).
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
        stay_location: cabin,
        lodgify_reservation_id: reservation.id,
        is_complimentary: isComplimentary,
        waiver_accepted_at: new Date().toISOString(),
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        rate_type: "daily",
        amount_cents: amountCents,
        status,
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
    isComplimentary,
    amountCents,
    cabin,
    guestName: reservation.guestName,
  });
}
