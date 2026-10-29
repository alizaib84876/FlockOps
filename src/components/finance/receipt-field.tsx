"use client";

import { useEffect, useRef, useState } from "react";

export function ReceiptField({
  currentUrl,
  existingPath,
}: {
  currentUrl?: string | null;
  existingPath?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [keepExisting, setKeepExisting] = useState(Boolean(existingPath));

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownUrl = preview ?? (keepExisting ? currentUrl : null);

  function clear() {
    setFile(null);
    setKeepExisting(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="sm:col-span-2">
      <input
        type="hidden"
        name="existing_receipt"
        value={keepExisting ? (existingPath ?? "") : ""}
      />
      <p className="text-sm font-medium text-ink">Receipt photo</p>
      <p className="mt-1 text-sm text-muted">Optional</p>
      {shownUrl ? (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-line bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shownUrl}
            alt="Receipt preview"
            className="max-h-56 w-full object-contain"
          />
          <button
            type="button"
            onClick={clear}
            aria-label="Remove receipt photo"
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/80 text-lg leading-none text-panel"
          >
            ×
          </button>
        </div>
      ) : null}
      <label className={shownUrl ? "sr-only" : "mt-3 block"}>
        <span className="sr-only">Upload receipt photo</span>
        <input
          ref={inputRef}
          name="receipt"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-xl border border-line bg-background px-3 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-sage-deep file:px-4 file:py-2 file:text-sm file:font-medium file:text-panel"
        />
      </label>
    </div>
  );
}
