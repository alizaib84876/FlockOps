export function Bone({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-line/70 ${className ?? ""}`} />
  );
}

export function PageChrome({
  kicker,
  title,
  back,
}: {
  kicker?: string;
  title: string;
  back?: string;
}) {
  return (
    <div>
      {back ? <p className="text-sm text-muted">{back}</p> : null}
      {kicker ? (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.18em] text-copper ${back ? "mt-3" : ""}`}
        >
          {kicker}
        </p>
      ) : null}
      <h1
        className={`display text-4xl text-ink ${kicker ? "mt-2" : back ? "mt-3" : ""}`}
      >
        {title}
      </h1>
    </div>
  );
}

export function FieldBones({
  count,
  columns = 1,
}: {
  count: number;
  columns?: 1 | 2;
}) {
  return (
    <div className={columns === 2 ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <Bone className="h-4 w-24" />
          <Bone className="mt-1.5 h-12 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function Panel({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-6">
      {title ? <h2 className="text-lg font-semibold text-ink">{title}</h2> : null}
      <div className={title ? "mt-5" : undefined}>{children}</div>
    </section>
  );
}

export function ListRows({ count }: { count: number }) {
  return (
    <ul className="grid gap-3">
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="rounded-2xl border border-line bg-panel px-5 py-4"
        >
          <Bone className="h-5 w-40" />
          <Bone className="mt-2 h-4 w-56" />
        </li>
      ))}
    </ul>
  );
}

export function LedgerRows({ count }: { count: number }) {
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-panel">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="px-5 py-4">
          <Bone className="h-5 w-48" />
          <Bone className="mt-2 h-4 w-64" />
        </li>
      ))}
    </ul>
  );
}

export function StatCards({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <article
          key={index}
          className="rounded-2xl border border-line bg-panel p-5"
        >
          <Bone className="h-3 w-20" />
          <Bone className="mt-3 h-8 w-16" />
        </article>
      ))}
    </div>
  );
}

export function ButtonBone({ className }: { className?: string }) {
  return (
    <Bone className={`h-12 w-32 rounded-full ${className ?? ""}`} />
  );
}
