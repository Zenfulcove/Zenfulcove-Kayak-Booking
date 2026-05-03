import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif text-2xl font-medium tracking-tight text-[var(--color-accent-strong)]">
            Zenfulcove
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            Kayak Booking
          </span>
        </Link>
        <Link
          href="/book"
          className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium transition hover:border-[var(--color-accent)]"
        >
          Book
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-12 md:px-10 md:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Reserve a Kayak
        </p>
        <h2 className="mt-4 max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          Out on the water.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-ink-muted)] md:text-lg">
          One rental is included with your stay. Pick a day, claim your boat,
          and add more if the whole crew wants in.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-accent-strong)]"
          >
            Book a Kayak →
          </Link>
          <Link
            href="/fleet"
            className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-medium transition hover:border-[var(--color-accent)]"
          >
            See the fleet
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-10 pt-6 text-xs text-[var(--color-ink-muted)] md:px-10 md:pb-14">
        <p>
          &copy; {new Date().getFullYear()} Zenfulcove ·{" "}
          <Link href="/terms" className="hover:text-[var(--color-accent)]">
            Terms
          </Link>{" "}
          ·{" "}
          <a
            href="tel:+15122737962"
            className="hover:text-[var(--color-accent)]"
          >
            +1 (512) 273-7962
          </a>
        </p>
      </footer>
    </div>
  );
}
