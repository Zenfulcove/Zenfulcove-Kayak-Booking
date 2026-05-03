import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZenfulCove Kayaks",
  description: "Book a kayak at ZenfulCove.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-[var(--color-accent-strong)]"
            >
              ZenfulCove Kayaks
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-[var(--color-accent)]">
                Home
              </Link>
              <Link href="/book" className="hover:text-[var(--color-accent)]">
                Book
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mt-16 border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-ink-muted)]">
          &copy; {new Date().getFullYear()} ZenfulCove
        </footer>
      </body>
    </html>
  );
}
