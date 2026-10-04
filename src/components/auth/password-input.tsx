"use client";

import { useId, useState } from "react";

export function PasswordInput({
  name,
  label,
  autoComplete,
  minLength,
}: {
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-xl border border-line bg-background px-4 pr-16 text-base outline-none ring-sage/30 focus:ring-4"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-3 text-sm font-medium text-muted hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
