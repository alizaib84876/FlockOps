export const EXPENSE_CATEGORIES = [
  "CHICK_PURCHASE",
  "FEED_DELIVERY",
  "MEDICINE_VACCINE",
  "UTILITIES",
  "LABOR",
  "MAINTENANCE",
  "MISCELLANEOUS",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export function categoryLabel(category: ExpenseCategory) {
  switch (category) {
    case "CHICK_PURCHASE":
      return "Chick purchase";
    case "FEED_DELIVERY":
      return "Feed delivery";
    case "MEDICINE_VACCINE":
      return "Medicine / vaccine";
    case "UTILITIES":
      return "Utilities";
    case "LABOR":
      return "Labor";
    case "MAINTENANCE":
      return "Maintenance";
    case "MISCELLANEOUS":
      return "Miscellaneous";
  }
}

export type Expense = {
  id: string;
  farm_id: string;
  flock_id: string | null;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expense_date: string;
  receipt_url: string | null;
  farm_name: string;
  flock_number: string | null;
};

export type Sale = {
  id: string;
  flock_id: string;
  sale_date: string;
  buyer_name: string;
  empty_weight_kg: number | null;
  loaded_weight_kg: number | null;
  total_weight_kg: number;
  price_per_kg: number;
  total_amount: number;
  driver_name: string | null;
  notes: string | null;
  flock_number: string;
  farm_name: string;
};

export type FinanceEdit = {
  id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  reason: string;
  created_at: string;
};

export function financeFieldLabel(field: string) {
  const labels: Record<string, string> = {
    farm_id: "Farm",
    flock_id: "Charge to",
    category: "Category",
    amount: "Amount",
    description: "Description",
    expense_date: "Date",
    receipt_url: "Receipt",
    sale_date: "Sale date",
    buyer_name: "Buyer",
    empty_weight_kg: "Empty vehicle",
    loaded_weight_kg: "Loaded vehicle",
    total_weight_kg: "Net chicken kg",
    price_per_kg: "Price per kg",
    driver_name: "Driver",
    notes: "Notes",
  };
  return labels[field] ?? field;
}

export function canSeeFinance(role: string) {
  return role === "OWNER" || role === "SUPERVISOR";
}

export function canSeeProfit(role: string) {
  return role === "OWNER";
}
