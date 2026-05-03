"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import KayakIllustration from "./KayakIllustration";
import BookingForm from "@/app/book/[kayakId]/BookingForm";
import BookingConfirmation from "./BookingConfirmation";
import { formatMoney, type BookingSuccess, type Kayak } from "@/lib/types";

function formatDateHeading(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`);
  return d
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default function BookingModal({
  kayak,
  dateIso,
  open,
  onClose,
}: {
  kayak: Kayak | null;
  dateIso: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [success, setSuccess] = useState<BookingSuccess | null>(null);

  // Reset confirmation state when the modal closes so reopening shows the form.
  useEffect(() => {
    if (!open) setSuccess(null);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="">
      {kayak &&
        dateIso &&
        (success ? (
          <BookingConfirmation booking={success} onDone={onClose} />
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink)]">
                {formatDateHeading(dateIso)}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-medium leading-[1.05] tracking-tight md:text-4xl">
                Almost there.
              </h2>
            </div>
            <header className="flex items-center gap-4 rounded-2xl bg-[var(--color-bg)] p-4">
              <KayakIllustration
                color={kayak.color}
                capacity={kayak.capacity}
                className="h-12 w-auto shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-medium tracking-tight">
                  {kayak.name}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  {kayak.capacity === 1 ? "Solo" : `${kayak.capacity}-seat`}
                  {kayak.length_feet ? ` · ${kayak.length_feet} ft` : ""}
                </p>
              </div>
              <p className="text-sm font-medium text-[var(--color-accent-strong)]">
                {formatMoney(kayak.daily_rate_cents)}/day
              </p>
            </header>
            <BookingForm kayak={kayak} dateIso={dateIso} onSuccess={setSuccess} />
          </div>
        ))}
    </Modal>
  );
}
