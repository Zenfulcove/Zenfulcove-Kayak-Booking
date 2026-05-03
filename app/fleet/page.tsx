import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { type Kayak } from "@/lib/types";
import FleetCalendar from "./FleetCalendar";

export const dynamic = "force-dynamic";

const DAYS = 7;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function FleetPage() {
  const supabase = await createSupabaseServerClient();
  const { data: kayakRows } = await supabase
    .from("kayaks")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  const kayaks = (kayakRows ?? []) as Kayak[];

  const rangeStart = startOfToday();
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + DAYS);

  const admin = createSupabaseAdminClient();
  const { data: bookingRows } = await admin
    .from("bookings")
    .select("kayak_id, starts_at, ends_at")
    .in("status", ["pending", "confirmed", "completed"])
    .lt("starts_at", rangeEnd.toISOString())
    .gt("ends_at", rangeStart.toISOString());

  const overlaps = (bookingRows ?? []).map((b) => ({
    kayakId: b.kayak_id as string,
    start: new Date(b.starts_at as string),
    end: new Date(b.ends_at as string),
  }));

  const dayDates = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const days = dayDates.map((d) => ({
    iso: toIsoDate(d),
    dow: d
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase(),
    day: d.getDate(),
  }));

  const bookedByKayak: Record<string, string[]> = {};
  for (const k of kayaks) {
    const ids: string[] = [];
    for (const d of dayDates) {
      const dayStart = d;
      const dayEnd = endOfDay(d);
      const isOut = overlaps.some(
        (b) => b.kayakId === k.id && b.start < dayEnd && b.end > dayStart
      );
      if (isOut) ids.push(toIsoDate(d));
    }
    bookedByKayak[k.id] = ids;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          The Fleet
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl">
          Open or out, this week.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Click any OPEN cell to book that kayak for that day.
        </p>
      </header>

      {kayaks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-ink-muted)]">
          No kayaks in the fleet yet.
        </p>
      ) : (
        <FleetCalendar
          kayaks={kayaks}
          days={days}
          bookedByKayak={bookedByKayak}
        />
      )}
    </div>
  );
}
