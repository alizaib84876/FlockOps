import type { SupabaseClient } from "@supabase/supabase-js";

export const RECEIPT_BUCKET = "expense-receipts";
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function extension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/heic" || file.type === "image/heif") return "heic";
  return "jpg";
}

export function receiptFileFromForm(formData: FormData) {
  const value = formData.get("receipt");
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

export async function uploadExpenseReceipt(
  supabase: SupabaseClient,
  organizationId: string,
  file: File,
): Promise<{ path?: string; error?: string }> {
  if (file.size > MAX_BYTES) {
    return { error: "Receipt photos must be under 4 MB." };
  }
  if (file.type && !TYPES.has(file.type) && !file.type.startsWith("image/")) {
    return { error: "Upload a photo of the receipt." };
  }

  const path = `${organizationId}/${crypto.randomUUID()}.${extension(file)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(RECEIPT_BUCKET).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    if (
      error.message.includes("Bucket not found") ||
      error.message.includes("not found")
    ) {
      return {
        error:
          "Run supabase/migrations/0011_expense_receipts.sql in the Supabase SQL editor to enable receipt photos.",
      };
    }
    return { error: error.message };
  }

  return { path };
}

export async function receiptDisplayUrl(
  supabase: SupabaseClient,
  receipt: string | null,
): Promise<string | null> {
  if (!receipt) return null;
  if (receipt.startsWith("http://") || receipt.startsWith("https://")) {
    return receipt;
  }
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(receipt, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
