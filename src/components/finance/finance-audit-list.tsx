import { financeFieldLabel, type FinanceEdit } from "@/lib/finance/types";

export function FinanceAuditList({ edits }: { edits: FinanceEdit[] }) {
  if (edits.length === 0) {
    return (
      <p className="text-sm text-muted">No corrections yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {edits.map((edit) => (
        <li key={edit.id} className="rounded-xl border border-line px-4 py-3 text-sm">
          <p className="font-medium text-ink">
            {financeFieldLabel(edit.field_name)}: {edit.old_value || "—"} →{" "}
            {edit.new_value || "—"}
          </p>
          <p className="mt-1 text-muted">{edit.reason}</p>
        </li>
      ))}
    </ul>
  );
}
