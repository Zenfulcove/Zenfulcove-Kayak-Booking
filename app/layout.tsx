import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import LayoutShell from "@/components/LayoutShell";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZenfulCove Kayaks",
  description: "Book a kayak at ZenfulCove.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

async function getCurrentUserEmail(): Promise<string | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userEmail = await getCurrentUserEmail();

  return (
    <html lang="en" className={fraunces.variable}>
      <body>
        <LayoutShell userEmail={userEmail}>{children}</LayoutShell>
      </body>
    </html>
  );
}
