import { formatMoney, type Kayak } from "@/lib/types";
import KayakIllustration from "@/components/KayakIllustration";

export default function KayakCard({
  kayak,
  onClick,
}: {
  kayak: Kayak;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full cursor-pointer overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] text-left transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative flex h-44 items-center justify-center bg-[var(--color-bg)]">
        <KayakIllustration
          color={kayak.color}
          capacity={kayak.capacity}
          className="h-20 w-auto"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink)] backdrop-blur">
          {kayak.capacity === 1 ? "Solo" : `${kayak.capacity}-seat`}
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-medium tracking-tight">
              {kayak.name}
            </h3>
            {kayak.length_feet && (
              <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                {kayak.length_feet} ft
              </p>
            )}
          </div>
          <span className="whitespace-nowrap text-sm font-medium text-[var(--color-accent-strong)]">
            {formatMoney(kayak.daily_rate_cents)}/day
          </span>
        </div>
        <div className="pt-1 text-sm font-medium text-[var(--color-accent-strong)] group-hover:underline">
          Reserve →
        </div>
      </div>
    </button>
  );
}
