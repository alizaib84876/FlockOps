import { ViewReceipt } from "@/components/finance/view-receipt";
import { financeFieldLabel, type FinanceEdit } from "@/lib/finance/types";

export function FinanceAuditList({
  edits,
  receiptHrefs,
}: {
  edits: FinanceEdit[];
  receiptHrefs?: Map<string, string>;
}) {
  if (edits.length === 0) {
    return (
      <p className="text-sm text-muted">No corrections yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {edits.map((edit) => (
        <li key={edit.id} className="rounded-xl border border-line px-4 py-3 text-sm">
          {edit.field_name === "receipt_url" ? (
            <p className="font-medium text-ink">
              Receipt:{" "}
              <ReceiptChange
                value={edit.old_value}
                href={receiptHrefs?.get(edit.old_value)}
                empty="None"
              />{" "}
              →{" "}
              <ReceiptChange
                value={edit.new_value}
                href={receiptHrefs?.get(edit.new_value)}
                empty="Removed"
              />
            </p>
          ) : (
            <p className="font-medium text-ink">
              {financeFieldLabel(edit.field_name)}: {edit.old_value || "—"} →{" "}
              {edit.new_value || "—"}
            </p>
          )}
          <p className="mt-1 text-muted">{edit.reason}</p>
        </li>
      ))}
    </ul>
  );
}

function ReceiptChange({
  value,
  href,
  empty,
}: {
  value: string;
  href?: string;
  empty: string;
}) {
  if (!value) return <span>{empty}</span>;
  if (href) return <ViewReceipt href={href} label="View" />;
  return <span>Photo</span>;
}
