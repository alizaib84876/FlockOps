"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { canSeeFinance, canSeeProfit, EXPENSE_CATEGORIES } from "@/lib/finance/types";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string };

function read(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

export async function createExpense(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  if (!canSeeFinance(profile.role)) {
    return { error: "Workers cannot log expenses." };
  }

  const farmId = read(formData, "farm_id");
  const flockId = read(formData, "flock_id");
  const category = read(formData, "category");
  const amount = Number(formData.get("amount"));
  const description = read(formData, "description");
  const expenseDate = read(formData, "expense_date");
  const receiptUrl = read(formData, "receipt_url");

  if (!farmId) return { error: "Select a farm." };
  if (!EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number])) {
    return { error: "Select a valid category." };
  }
  if (Number.isNaN(amount) || amount < 0) return { error: "Amount cannot be negative." };
  if (!description) return { error: "Description is required." };
  if (!expenseDate) return { error: "Date is required." };

  const supabase = await createClient();

  if (flockId) {
    const { data: flock, error: flockError } = await supabase
      .from("flocks")
      .select("id, status, sheds(farm_id)")
      .eq("id", flockId)
      .maybeSingle();
    if (flockError || !flock) return { error: "Select an active flock." };
    if (flock.status !== "ACTIVE") {
      return { error: "Harvested and closed flocks cannot be charged." };
    }
  }
  const { error } = await supabase.from("expenses").insert({
    farm_id: farmId,
    flock_id: flockId || null,
    category,
    amount,
    description,
    expense_date: expenseDate,
    receipt_url: receiptUrl || null,
    logged_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/expenses");
  redirect("/app/expenses");
}

export async function createSale(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  if (!canSeeProfit(profile.role)) {
    return { error: "Only the owner can record bird sales." };
  }

  const flockId = read(formData, "flock_id");
  const saleDate = read(formData, "sale_date");
  const buyerName = read(formData, "buyer_name");
  const emptyWeight = Number(formData.get("empty_weight_kg"));
  const loadedWeight = Number(formData.get("loaded_weight_kg"));
  const pricePerKg = Number(formData.get("price_per_kg"));
  const driverName = read(formData, "driver_name");
  const notes = read(formData, "notes");
  const netWeight = loadedWeight - emptyWeight;

  if (!flockId) return { error: "Select a flock." };
  if (!saleDate) return { error: "Sale date is required." };
  if (!buyerName) return { error: "Buyer name is required." };
  if (Number.isNaN(emptyWeight) || emptyWeight < 0) {
    return { error: "Empty vehicle weight cannot be negative." };
  }
  if (Number.isNaN(loadedWeight) || loadedWeight <= 0) {
    return { error: "Loaded vehicle weight must be greater than zero." };
  }
  if (Number.isNaN(netWeight) || netWeight <= 0) {
    return { error: "Loaded weight must be greater than the empty vehicle weight." };
  }
  if (Number.isNaN(pricePerKg) || pricePerKg < 0) {
    return { error: "Price per kg cannot be negative." };
  }

  const supabase = await createClient();
  const { data: flock, error: flockError } = await supabase
    .from("flocks")
    .select("id, status")
    .eq("id", flockId)
    .maybeSingle();
  if (flockError || !flock || flock.status !== "ACTIVE") {
    return { error: "Sales can only be recorded against an active flock." };
  }

  const { error } = await supabase.from("sales").insert({
    flock_id: flockId,
    sale_date: saleDate,
    buyer_name: buyerName,
    birds_sold: 0,
    empty_weight_kg: emptyWeight,
    loaded_weight_kg: loadedWeight,
    total_weight_kg: netWeight,
    price_per_kg: pricePerKg,
    driver_name: driverName || null,
    notes: notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/expenses");
  redirect("/app/expenses");
}

export async function updateExpense(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  if (!canSeeFinance(profile.role)) {
    return { error: "Workers cannot edit expenses." };
  }

  const expenseId = read(formData, "expense_id");
  const farmId = read(formData, "farm_id");
  const flockId = read(formData, "flock_id");
  const category = read(formData, "category");
  const amount = Number(formData.get("amount"));
  const description = read(formData, "description");
  const expenseDate = read(formData, "expense_date");
  const receiptUrl = read(formData, "receipt_url");
  const reason = read(formData, "reason");

  if (!expenseId) return { error: "Expense is missing." };
  if (!farmId) return { error: "Select a farm." };
  if (!EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number])) {
    return { error: "Select a valid category." };
  }
  if (Number.isNaN(amount) || amount < 0) return { error: "Amount cannot be negative." };
  if (!description) return { error: "Description is required." };
  if (!expenseDate) return { error: "Date is required." };
  if (!reason) return { error: "A reason is required to correct an expense." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_expense", {
    p_id: expenseId,
    p_farm_id: farmId,
    p_flock_id: flockId || null,
    p_category: category,
    p_amount: amount,
    p_description: description,
    p_expense_date: expenseDate,
    p_receipt_url: receiptUrl || null,
    p_reason: reason,
  });

  if (error) {
    if (
      error.message.includes("Could not find the function") ||
      error.code === "PGRST202"
    ) {
      return {
        error:
          "Run supabase/migrations/0004_finance_edits.sql in the Supabase SQL editor to enable expense corrections.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/expenses");
  revalidatePath(`/app/expenses/${expenseId}`);
  redirect(`/app/expenses/${expenseId}`);
}

export async function updateSale(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  if (!canSeeProfit(profile.role)) {
    return { error: "Only the owner can edit sales." };
  }

  const saleId = read(formData, "sale_id");
  const flockId = read(formData, "flock_id");
  const saleDate = read(formData, "sale_date");
  const buyerName = read(formData, "buyer_name");
  const emptyWeight = Number(formData.get("empty_weight_kg"));
  const loadedWeight = Number(formData.get("loaded_weight_kg"));
  const pricePerKg = Number(formData.get("price_per_kg"));
  const driverName = read(formData, "driver_name");
  const notes = read(formData, "notes");
  const reason = read(formData, "reason");
  const netWeight = loadedWeight - emptyWeight;

  if (!saleId) return { error: "Sale is missing." };
  if (!flockId) return { error: "Select a flock." };
  if (!saleDate) return { error: "Sale date is required." };
  if (!buyerName) return { error: "Buyer name is required." };
  if (Number.isNaN(emptyWeight) || emptyWeight < 0) {
    return { error: "Empty vehicle weight cannot be negative." };
  }
  if (Number.isNaN(loadedWeight) || loadedWeight <= 0) {
    return { error: "Loaded vehicle weight must be greater than zero." };
  }
  if (Number.isNaN(netWeight) || netWeight <= 0) {
    return { error: "Loaded weight must be greater than the empty vehicle weight." };
  }
  if (Number.isNaN(pricePerKg) || pricePerKg < 0) {
    return { error: "Price per kg cannot be negative." };
  }
  if (!reason) return { error: "A reason is required to correct a sale." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_sale", {
    p_id: saleId,
    p_flock_id: flockId,
    p_sale_date: saleDate,
    p_buyer_name: buyerName,
    p_empty_weight_kg: emptyWeight,
    p_loaded_weight_kg: loadedWeight,
    p_price_per_kg: pricePerKg,
    p_driver_name: driverName || null,
    p_notes: notes || null,
    p_reason: reason,
  });

  if (error) {
    if (
      error.message.includes("Could not find the function") ||
      error.code === "PGRST202"
    ) {
      return {
        error:
          "Run supabase/migrations/0004_finance_edits.sql in the Supabase SQL editor to enable sale corrections.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/expenses");
  revalidatePath(`/app/sales/${saleId}`);
  redirect(`/app/sales/${saleId}`);
}
