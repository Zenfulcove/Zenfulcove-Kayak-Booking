"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "./Modal";
import KayakIllustration from "./KayakIllustration";
import BookingForm, {
  type Validation,
} from "@/app/book/[kayakId]/BookingForm";
import BookingConfirmation from "./BookingConfirmation";
import { formatMoney, type BookingSuccess, type Kayak } from "@/lib/types";
import { formatLongDate } from "@/lib/dates";

function firstNameOf(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0];
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
  const [previewName, setPreviewName] = useState("");
  const [validation, setValidation] = useState<Validation>({ status: "idle" });

  // Reset state when modal closes so reopening shows a fresh form.
  useEffect(() => {
    if (!open) {
      setSuccess(null);
      setPreviewName("");
      setValidation({ status: "idle" });
    }
  }, [open]);

  // Stable callbacks so the BookingForm useEffects don't re-fire each render.
  const handlePreviewName = useCallback((value: string) => {
    setPreviewName(value);
  }, []);
  const handleValidation = useCallback((value: Validation) => {
    setValidation(value);
  }, []);

  const isFree = validation.status === "ok" && validation.isFree;
  const greetingName = firstNameOf(previewName);
  const heading = greetingName
    ? `Almost there, ${greetingName}.`
    : "Almost there.";

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
                {formatLongDate(dateIso)}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-medium leading-[1.05] tracking-tight md:text-4xl">
                {heading}
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
              <div className="text-right">
                {isFree ? (
                  <>
                    <p className="text-xs font-medium text-[var(--color-ink-muted)] line-through">
                      {formatMoney(kayak.daily_rate_cents)}/day
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[var(--color-accent-strong)]">
                      Free
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-[var(--color-accent-strong)]">
                    {formatMoney(kayak.daily_rate_cents)}/day
                  </p>
                )}
              </div>
            </header>
            <BookingForm
              kayak={kayak}
              dateIso={dateIso}
              onSuccess={setSuccess}
              onPreviewNameChange={handlePreviewName}
              onValidationChange={handleValidation}
            />
          </div>
        ))}
    </Modal>
  );
}
