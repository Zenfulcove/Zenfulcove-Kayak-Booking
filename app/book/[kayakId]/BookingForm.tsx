"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, type Kayak } from "@/lib/types";

type RateType = "hourly" | "daily";

export default function BookingForm({ kayak }: { kayak: Kayak }) {
  const router = useRouter();
  const [rateType, setRateType] = useState<RateType>("hourly");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountCents = useMemo(() => {
    if (!startsAt || !endsAt) return 0;
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();
    if (!isFinite(start) || !isFinite(end) || end <= start) return 0;
    const ms = end - start;
    if (rateType === "hourly") {
      const hours = Math.ceil(ms / (1000 * 60 * 60));
      return hours * kayak.hourly_rate_cents;
    }
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days * kayak.daily_rate_cents;
  }, [startsAt, endsAt, rateType, kayak]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kayakId: kayak.id,
          startsAt,
          endsAt,
          rateType,
          customerName: name,
          customerEmail: email,
          customerPhone: phone || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Booking failed");
      router.push(`/book/confirmation/${json.bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Rate</legend>
        <div className="flex gap-2">
          {(["hourly", "daily"] as RateType[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRateType(r)}
              className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${
                rateType === r
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : "border-[var(--color-border)] bg-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts at">
          <input
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Ends at">
          <input
            type="datetime-local"
            required
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <Field label="Phone (optional)">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input"
        />
      </Field>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <div className="text-sm text-[var(--color-ink-muted)]">Estimated</div>
        <div className="text-xl font-semibold">{formatMoney(amountCents)}</div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || amountCents === 0}
        className="w-full rounded-full bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Reserving…" : "Reserve & continue to payment"}
      </button>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-[var(--color-ink-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
