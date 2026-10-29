export function ReceiptField({
  currentUrl,
}: {
  currentUrl?: string | null;
}) {
  return (
    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-ink">
        Receipt photo
        <input
          name="receipt"
          type="file"
          accept="image/*"
          capture="environment"
          className="mt-1.5 w-full rounded-xl border border-line bg-background px-3 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-sage-deep file:px-4 file:py-2 file:text-sm file:font-medium file:text-panel"
        />
      </label>
      <p className="mt-1.5 text-sm text-muted">Optional. Phone photos work.</p>
      {currentUrl ? (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block overflow-hidden rounded-xl border border-line"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Current receipt"
            className="max-h-56 w-full bg-background object-contain"
          />
        </a>
      ) : null}
    </div>
  );
}
