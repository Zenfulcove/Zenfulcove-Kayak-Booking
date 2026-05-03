"use client";

import { useState } from "react";
import BookingModal from "@/components/BookingModal";
import KayakCard from "./KayakCard";
import { type Kayak } from "@/lib/types";

export default function AvailableKayaks({
  kayaks,
  dateIso,
}: {
  kayaks: Kayak[];
  dateIso: string;
}) {
  const [active, setActive] = useState<Kayak | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kayaks.map((k) => (
          <KayakCard key={k.id} kayak={k} onClick={() => setActive(k)} />
        ))}
      </div>

      <BookingModal
        kayak={active}
        dateIso={dateIso}
        open={active !== null}
        onClose={() => setActive(null)}
      />
    </>
  );
}
