import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { formatMoney, type Kayak } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("kayaks")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const kayaks = (data ?? []) as Kayak[];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Pick your kayak
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Hourly and daily rates. Reserve a slot and pay to confirm.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Could not load kayaks. {error.message}
        </p>
      ) : kayaks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-ink-muted)]">
          No kayaks available yet. Check back soon.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {kayaks.map((k) => (
            <li
              key={k.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{k.name}</h2>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {k.description ?? `Seats ${k.capacity}`}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-medium">
                  {k.capacity === 1 ? "Solo" : `${k.capacity}-person`}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-[var(--color-ink-muted)]">
                    Hourly
                  </dt>
                  <dd className="font-medium">
                    {formatMoney(k.hourly_rate_cents)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-ink-muted)]">
                    Daily
                  </dt>
                  <dd className="font-medium">
                    {formatMoney(k.daily_rate_cents)}
                  </dd>
                </div>
              </dl>
              <Link
                href={`/book/${k.id}`}
                className="mt-5 inline-flex items-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                Reserve →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
