"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STAY_OPTIONS,
  type BookingSuccess,
  type Kayak,
  type StayOption,
} from "@/lib/types";

type FieldName = "name" | "email" | "phone" | "stay" | "waiver";

const noErrors: Record<FieldName, boolean> = {
  name: false,
  email: false,
  phone: false,
  stay: false,
  waiver: false,
};

function shake(el: HTMLElement | null) {
  if (!el) return;
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-8px)" },
      { transform: "translateX(8px)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(-3px)" },
      { transform: "translateX(3px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 420, easing: "ease-out" }
  );
}

export default function BookingForm({
  kayak,
  dateIso,
  onSuccess,
}: {
  kayak: Kayak;
  dateIso: string;
  onSuccess?: (result: BookingSuccess) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stay, setStay] = useState<StayOption | null>(null);
  const [waiver, setWaiver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] =
    useState<Record<FieldName, boolean>>(noErrors);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const stayRef = useRef<HTMLDivElement>(null);
  const waiverRef = useRef<HTMLLabelElement>(null);

  function clearFieldError(field: FieldName) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const next: Record<FieldName, boolean> = { ...noErrors };
    if (name.trim().length === 0) next.name = true;
    if (email.trim().length === 0 || !/.+@.+\..+/.test(email.trim())) {
      next.email = true;
    }
    if (phone.trim().length === 0) next.phone = true;
    if (stay === null) next.stay = true;
    if (!waiver) next.waiver = true;

    const anyError = Object.values(next).some(Boolean);
    setErrors(next);

    if (anyError) {
      if (next.name) shake(nameRef.current);
      if (next.email) shake(emailRef.current);
      if (next.phone) shake(phoneRef.current);
      if (next.stay) shake(stayRef.current);
      if (next.waiver) shake(waiverRef.current);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kayakId: kayak.id,
          dateIso,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          stayLocation: stay,
          waiverAccepted: waiver,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Booking failed");

      const result: BookingSuccess = {
        bookingId: json.bookingId,
        referenceCode: json.referenceCode,
        lockboxCode: json.lockboxCode ?? null,
        customerName: name.trim(),
        dateIso,
        kayak,
        stayLocation: stay as string,
      };

      if (onSuccess) {
        onSuccess(result);
        router.refresh();
      } else {
        router.push(`/book/confirmation/${json.bookingId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputBaseClass =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm transition focus:outline-none";
  const inputOk =
    "border-[var(--color-border)] focus:border-[var(--color-accent)]";
  const inputBad = "border-red-500 focus:border-red-500";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="customer_name"
          className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]"
        >
          Your Name
        </label>
        <input
          ref={nameRef}
          id="customer_name"
          type="text"
          placeholder="Who's paddling?"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
          className={`${inputBaseClass} ${errors.name ? inputBad : inputOk}`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="customer_email"
            className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="customer_email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            className={`${inputBaseClass} ${errors.email ? inputBad : inputOk}`}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="customer_phone"
            className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]"
          >
            Phone
          </label>
          <input
            ref={phoneRef}
            id="customer_phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearFieldError("phone");
            }}
            className={`${inputBaseClass} ${errors.phone ? inputBad : inputOk}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
          Where&apos;s your stay
        </p>
        <div ref={stayRef} className="grid grid-cols-2 gap-2">
          {STAY_OPTIONS.map((opt) => {
            const isActive = stay === opt;
            const stateClass = isActive
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm"
              : errors.stay
                ? "border-red-500 bg-white text-[var(--color-ink)]"
                : "border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-accent)]";
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setStay(opt);
                  clearFieldError("stay");
                }}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition ${stateClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <label
        ref={waiverRef}
        className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition ${
          errors.waiver
            ? "border-red-500"
            : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
        }`}
      >
        <input
          type="checkbox"
          checked={waiver}
          onChange={(e) => {
            setWaiver(e.target.checked);
            clearFieldError("waiver");
          }}
          className="mt-0.5 h-4 w-4 cursor-pointer rounded border-[var(--color-border)] accent-[var(--color-accent)]"
        />
        <span className="block flex-1">
          <span className="block text-sm font-medium">
            I agree to the kayak safety waiver
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-[var(--color-ink-muted)]">
            Rental includes paddles and life jackets. I agree to wear a life
            jacket at all times, return the kayak by the end of the rental day,
            and accept the cancellation policy and liability waiver.{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-strong)]"
            >
              View full terms ↗
            </a>
          </span>
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full cursor-pointer rounded-full bg-[var(--color-accent)] py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Reserving…" : "Confirm reservation"}
      </button>
    </form>
  );
}
