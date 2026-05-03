"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

type DateOption = { iso: string; date: Date; available: number };

export default function DateSelector({
  dates,
  selected,
}: {
  dates: DateOption[];
  selected: string;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedDate =
    dates.find((d) => d.iso === selected)?.date ?? dates[0]?.date ?? new Date();
  const monthLabel = selectedDate
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();

  function scrollByDays(n: number) {
    const el = scrollRef.current;
    if (!el) return;
    const firstChip = el.querySelector("button");
    const chipWidth = firstChip
      ? firstChip.getBoundingClientRect().width + 8 // chip + gap-2 (~8px)
      : 96;
    el.scrollBy({ left: chipWidth * n, behavior: "smooth" });
  }

  function scrollToToday() {
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
          {monthLabel}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollByDays(-7)}
            aria-label="Previous week"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-base leading-none text-[var(--color-ink-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={scrollToToday}
            className="cursor-pointer rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => scrollByDays(7)}
            aria-label="Next week"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-base leading-none text-[var(--color-ink-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
          {dates.map(({ iso, date, available }) => {
            const isSelected = iso === selected;
            const isFull = available === 0;
            const dow = date
              .toLocaleDateString("en-US", { weekday: "short" })
              .toUpperCase();
            const day = date.getDate();
            return (
              <button
                key={iso}
                type="button"
                onClick={() =>
                  router.push(`/book?date=${iso}`, { scroll: false })
                }
                className={`flex min-w-[88px] shrink-0 cursor-pointer flex-col items-center rounded-2xl border px-4 py-3.5 text-center transition ${
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm"
                    : isFull
                      ? "border-[var(--color-border)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-accent)]"
                      : "border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-accent)]"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold tracking-wider ${
                    isSelected ? "opacity-80" : "text-[var(--color-ink-muted)]"
                  }`}
                >
                  {dow}
                </span>
                <span className="mt-1.5 text-2xl font-semibold leading-none">
                  {day}
                </span>
                <span
                  className={`mt-2 text-[11px] font-medium ${
                    isSelected
                      ? "opacity-90"
                      : isFull
                        ? "text-red-600"
                        : "text-[var(--color-accent-strong)]"
                  }`}
                >
                  {isFull ? "Full" : `${available} Open`}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
