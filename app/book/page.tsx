import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import type { Kayak } from "@/lib/types";
import DateSelector from "./DateSelector";
import AvailableKayaks from "./AvailableKayaks";

export const dynamic = "force-dynamic";

const DAYS_AHEAD = 30;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseSelectedDate(value: string | undefined): Date {
  if (!value) return startOfToday();
  const parsed = new Date(`${value}T00:00:00`);
  if (!isFinite(parsed.getTime())) return startOfToday();
  parsed.setHours(0, 0, 0, 0);
  return parsed;
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

function formatDateHeading(d: Date): string {
  return d
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selected = parseSelectedDate(date);
  const selectedIso = toIsoDate(selected);

  const supabase = await createSupabaseServerClient();
  const { data: kayakRows } = await supabase
    .from("kayaks")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  const kayaks = (kayakRows ?? []) as Kayak[];

  // Pull every booking overlapping the 30-day window so we can compute
  // availability per day and per kayak. RLS hides bookings from anon, so we
  // use the admin client server-side.
  const rangeStart = startOfToday();
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + DAYS_AHEAD);

  const admin = createSupabaseAdminClient();
  const { data: bookingsInRange } = await admin
    .from("bookings")
    .select("kayak_id, starts_at, ends_at")
    .in("status", ["pending", "confirmed", "completed"])
    .lt("starts_at", rangeEnd.toISOString())
    .gt("ends_at", rangeStart.toISOString());

  const overlaps = (
    bookingsInRange ?? []
  ).map((b) => ({
    kayakId: b.kayak_id as string,
    start: new Date(b.starts_at as string),
    end: new Date(b.ends_at as string),
  }));

  function bookedKayakIdsOn(day: Date): Set<string> {
    const dayStart = day;
    const dayEnd = endOfDay(day);
    const set = new Set<string>();
    for (const b of overlaps) {
      if (b.start < dayEnd && b.end > dayStart) {
        set.add(b.kayakId);
      }
    }
    return set;
  }

  const dateOptions = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    const booked = bookedKayakIdsOn(d);
    return {
      iso: toIsoDate(d),
      date: d,
      available: Math.max(0, kayaks.length - booked.size),
    };
  });

  const bookedToday = bookedKayakIdsOn(selected);
  const bookedIds = Array.from(bookedToday);
  const available = kayaks.filter((k) => !bookedToday.has(k.id));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Reserve a Kayak
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl">
          Out on the water.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
          One rental is included with your stay. Pick a day, claim your boat,
          and add more if the whole crew wants in.
        </p>
      </section>

      <DateSelector dates={dateOptions} selected={selectedIso} />

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink)]">
            {formatDateHeading(selected)}
          </h2>
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">
            {available.length === 0
              ? "No kayaks ready"
              : available.length === 1
                ? "1 kayak ready"
                : `${available.length} kayaks ready`}
          </p>
        </div>

        {kayaks.length > 0 ? (
          <div className="mt-4">
            <AvailableKayaks
              kayaks={kayaks}
              bookedIds={bookedIds}
              dateIso={selectedIso}
            />
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-6 text-center text-sm text-[var(--color-ink-muted)]">
            No kayaks in the fleet yet. Add some in Supabase to get started.
          </p>
        )}
      </section>
    </div>
  );
}
