import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { formatMoney, type Booking, type Kayak } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const [kayaksResp, bookingsResp] = await Promise.all([
    supabase
      .from("kayaks")
      .select("*")
      .order("display_order", { ascending: true }),
    supabase
      .from("bookings")
      .select("*")
      .order("starts_at", { ascending: false })
      .limit(50),
  ]);

  const kayaks = (kayaksResp.data ?? []) as Kayak[];
  const bookings = (bookingsResp.data ?? []) as Booking[];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Manage your fleet and review reservations.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Fleet ({kayaks.length})
        </h2>
        {kayaks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-ink-muted)]">
            No kayaks yet. Insert rows into <code>public.kayaks</code> in
            Supabase to get started.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Capacity</th>
                  <th className="px-4 py-2">Hourly</th>
                  <th className="px-4 py-2">Daily</th>
                  <th className="px-4 py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {kayaks.map((k) => (
                  <tr key={k.id} className="border-t border-[var(--color-border)]">
                    <td className="px-4 py-2 font-medium">{k.name}</td>
                    <td className="px-4 py-2">{k.capacity}</td>
                    <td className="px-4 py-2">
                      {formatMoney(k.hourly_rate_cents)}
                    </td>
                    <td className="px-4 py-2">
                      {formatMoney(k.daily_rate_cents)}
                    </td>
                    <td className="px-4 py-2">{k.is_active ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Recent bookings ({bookings.length})
        </h2>
        {bookings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-ink-muted)]">
            No bookings yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                <tr>
                  <th className="px-4 py-2">When</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-[var(--color-border)]">
                    <td className="px-4 py-2">
                      {new Date(b.starts_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{b.customer_name}</div>
                      <div className="text-xs text-[var(--color-ink-muted)]">
                        {b.customer_email}
                      </div>
                    </td>
                    <td className="px-4 py-2 capitalize">{b.status}</td>
                    <td className="px-4 py-2">
                      {formatMoney(b.amount_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
