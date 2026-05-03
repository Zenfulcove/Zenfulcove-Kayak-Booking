import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { type Booking, type Kayak } from "@/lib/types";
import FleetManager from "./FleetManager";
import BookingsTable from "./BookingsTable";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const [kayaksResp, bookingsResp] = await Promise.all([
    supabase
      .from("kayaks")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("bookings")
      .select("*")
      .order("starts_at", { ascending: false })
      .limit(50),
  ]);

  const kayaks = (kayaksResp.data ?? []) as Kayak[];
  const bookings = (bookingsResp.data ?? []) as Booking[];

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Admin
          </p>
          <h1 className="mt-3 font-serif text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
            Dashboard
          </h1>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium transition hover:border-[var(--color-accent)]"
          >
            Sign out
          </button>
        </form>
      </header>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-medium tracking-tight">
            Fleet ({kayaks.length})
          </h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Click a card to edit.
          </p>
        </div>
        <FleetManager kayaks={kayaks} />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-medium tracking-tight">
            Recent bookings ({bookings.length})
          </h2>
          {bookings.length > 0 && (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Click a row to view or delete.
            </p>
          )}
        </div>
        <BookingsTable bookings={bookings} kayaks={kayaks} />
      </section>
    </div>
  );
}
