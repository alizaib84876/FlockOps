import { listFarms } from "@/lib/farms/queries";
import { listFlocks } from "@/lib/flocks/queries";
import { createClient } from "@/lib/supabase/server";
import type {
  Expense,
  ExpenseCategory,
  FinanceEdit,
  Sale,
} from "@/lib/finance/types";

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function listExpenses(): Promise<Expense[]> {
  const farmIds = (await listFarms()).map((farm) => farm.id);
  if (farmIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id, farm_id, flock_id, category, amount, description, expense_date, receipt_url, farms(name), flocks(flock_number)",
    )
    .in("farm_id", farmIds)
    .order("expense_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const farm = first(row.farms as { name: string } | { name: string }[] | null);
    const flock = first(
      row.flocks as { flock_number: string } | { flock_number: string }[] | null,
    );
    return {
      id: String(row.id),
      farm_id: String(row.farm_id),
      flock_id: row.flock_id ? String(row.flock_id) : null,
      category: row.category as ExpenseCategory,
      amount: Number(row.amount),
      description: String(row.description),
      expense_date: String(row.expense_date),
      receipt_url: row.receipt_url ? String(row.receipt_url) : null,
      farm_name: farm?.name ?? "Farm",
      flock_number: flock?.flock_number ?? null,
    };
  });
}

export async function listSales(): Promise<Sale[]> {
  const flockIds = (await listFlocks()).map((flock) => flock.id);
  if (flockIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, flock_id, sale_date, buyer_name, empty_weight_kg, loaded_weight_kg, total_weight_kg, price_per_kg, total_amount, driver_name, notes, flocks(flock_number, sheds(farms(name)))",
    )
    .in("flock_id", flockIds)
    .order("sale_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const flock = first(
      row.flocks as
        | {
            flock_number: string;
            sheds:
              | { farms: { name: string } | { name: string }[] | null }
              | { farms: { name: string } | { name: string }[] | null }[]
              | null;
          }
        | {
            flock_number: string;
            sheds:
              | { farms: { name: string } | { name: string }[] | null }
              | { farms: { name: string } | { name: string }[] | null }[]
              | null;
          }[]
        | null,
    );
    const shed = first(flock?.sheds);
    const farm = first(shed?.farms);

    return {
      id: String(row.id),
      flock_id: String(row.flock_id),
      sale_date: String(row.sale_date),
      buyer_name: String(row.buyer_name),
      empty_weight_kg:
        row.empty_weight_kg === null || row.empty_weight_kg === undefined
          ? null
          : Number(row.empty_weight_kg),
      loaded_weight_kg:
        row.loaded_weight_kg === null || row.loaded_weight_kg === undefined
          ? null
          : Number(row.loaded_weight_kg),
      total_weight_kg: Number(row.total_weight_kg),
      price_per_kg: Number(row.price_per_kg),
      total_amount: Number(row.total_amount),
      driver_name: row.driver_name ? String(row.driver_name) : null,
      notes: row.notes ? String(row.notes) : null,
      flock_number: flock?.flock_number ?? "Flock",
      farm_name: farm?.name ?? "Farm",
    };
  });
}

export async function getExpense(expenseId: string): Promise<Expense | null> {
  const rows = await listExpenses();
  return rows.find((row) => row.id === expenseId) ?? null;
}

export async function getSale(saleId: string): Promise<Sale | null> {
  const rows = await listSales();
  return rows.find((row) => row.id === saleId) ?? null;
}

export async function listExpenseEdits(expenseId: string): Promise<FinanceEdit[]> {
  const expense = await getExpense(expenseId);
  if (!expense) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_edits")
    .select("id, field_name, old_value, new_value, reason, created_at")
    .eq("expense_id", expenseId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FinanceEdit[];
}

export async function listSaleEdits(saleId: string): Promise<FinanceEdit[]> {
  const sale = await getSale(saleId);
  if (!sale) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sale_edits")
    .select("id, field_name, old_value, new_value, reason, created_at")
    .eq("sale_id", saleId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FinanceEdit[];
}
