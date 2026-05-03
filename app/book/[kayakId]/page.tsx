import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { formatMoney, type Kayak } from "@/lib/types";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";

export const dynamic = "force-dynamic";

export default async function KayakBookingPage({
  params,
}: {
  params: Promise<{ kayakId: string }>;
}) {
  const { kayakId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("kayaks")
    .select("*")
    .eq("id", kayakId)
    .eq("is_active", true)
    .maybeSingle();

  const kayak = data as Kayak | null;
  if (!kayak) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{kayak.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {kayak.description ?? `Seats ${kayak.capacity}`}
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <span>Hourly: {formatMoney(kayak.hourly_rate_cents)}</span>
          <span>Daily: {formatMoney(kayak.daily_rate_cents)}</span>
        </div>
      </header>
      <BookingForm kayak={kayak} />
    </div>
  );
}
