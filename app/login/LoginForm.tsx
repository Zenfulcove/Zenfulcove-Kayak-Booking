"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace(redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Internal access only.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
          />
        </label>
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[var(--color-accent)] py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
