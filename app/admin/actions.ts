"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { COLOR_OPTIONS } from "@/lib/types";

const allowedColors = new Set(COLOR_OPTIONS.map((c) => c.value));

type KayakWritable = {
  code: string;
  name: string;
  capacity: number;
  length_feet: number;
  daily_rate_cents: number;
  color: string;
  is_active: boolean;
};

function parseKayakFields(formData: FormData): KayakWritable {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const capacity = Number(formData.get("capacity"));
  const lengthFeet = Number(formData.get("length_feet"));
  const dailyDollars = Number(formData.get("daily_rate"));
  const isActive = formData.get("is_active") === "on";
  const color = String(formData.get("color") ?? "");

  if (!name) throw new Error("Name is required.");
  if (!code) throw new Error("Code is required.");
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 6) {
    throw new Error("Capacity must be a whole number between 1 and 6.");
  }
  if (!Number.isInteger(lengthFeet) || lengthFeet < 1 || lengthFeet > 30) {
    throw new Error("Length must be a whole number of feet between 1 and 30.");
  }
  if (!Number.isFinite(dailyDollars) || dailyDollars < 0) {
    throw new Error("Daily rate must be zero or positive.");
  }
  if (!allowedColors.has(color)) {
    throw new Error("Pick a valid color.");
  }

  return {
    code,
    name,
    capacity,
    length_feet: lengthFeet,
    daily_rate_cents: Math.round(dailyDollars * 100),
    color,
    is_active: isActive,
  };
}

function explainSaveError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "That code is already in use.";
  return `Save failed: ${error.message}`;
}

export async function createKayak(formData: FormData) {
  const fields = parseKayakFields(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("kayaks").insert(fields);
  if (error) throw new Error(explainSaveError(error));

  revalidatePath("/admin");
  revalidatePath("/book");
  revalidatePath("/fleet");
}

export async function updateKayak(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing kayak id.");

  const fields = parseKayakFields(formData);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("kayaks").update(fields).eq("id", id);
  if (error) throw new Error(explainSaveError(error));

  revalidatePath("/admin");
  revalidatePath("/book");
  revalidatePath("/fleet");
}

export async function deleteKayak(id: string) {
  if (!id) throw new Error("Missing kayak id.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("kayaks").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "Can't delete: this kayak has bookings. Mark it inactive instead."
      );
    }
    throw new Error(`Delete failed: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/book");
  revalidatePath("/fleet");
}

export async function deleteBooking(id: string) {
  if (!id) throw new Error("Missing booking id.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw new Error(`Delete failed: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/book");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
