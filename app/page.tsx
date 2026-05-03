import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-[var(--color-surface)] p-10 shadow-sm">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-accent-strong)]">
          Paddle the cove.
        </h1>
        <p className="mt-3 max-w-xl text-[var(--color-ink-muted)]">
          Reserve a kayak by the hour or the day. Quiet water, good vibes,
          straight from the dock.
        </p>
        <Link
          href="/book"
          className="mt-6 inline-flex items-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-accent-strong)]"
        >
          Book a kayak →
        </Link>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Hourly rentals" body="Quick paddles for sunrise or sunset." />
        <Card title="Full-day adventures" body="Pack a lunch and explore the cove." />
        <Card title="Solo or tandem" body="Boats sized for one or two paddlers." />
      </section>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{body}</p>
    </div>
  );
}
