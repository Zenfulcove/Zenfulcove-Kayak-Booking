"use client";

import { useState } from "react";
import { deleteBooking } from "./actions";
import { formatMoney, type Booking } from "@/lib/types";

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(b: Booking) {
    const label = b.customer_name || "this booking";
    if (
      !window.confirm(
        `Delete booking for ${label}? The kayak becomes available again.`
      )
    ) {
      return;
    }
    setError(null);
    setDeletingId(b.id);
    try {
      await deleteBooking(b.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <p className="mt-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-ink-muted)]">
        No bookings yet.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg)] text-left text-[11px] uppercase tracking-wider text-[var(--color-ink-muted)]">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Stay</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const isDeleting = deletingId === b.id;
              return (
                <tr key={b.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3">
                    {new Date(b.starts_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.customer_name}</div>
                    {b.customer_email && (
                      <div className="text-xs text-[var(--color-ink-muted)]">
                        {b.customer_email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                    {b.stay_location ?? "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">{b.status}</td>
                  <td className="px-4 py-3">{formatMoney(b.amount_cents)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(b)}
                      disabled={isDeleting}
                      className="cursor-pointer rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
