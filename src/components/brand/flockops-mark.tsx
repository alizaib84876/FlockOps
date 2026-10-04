export function FlockOpsMark({ className }: { className?: string }) {
  return (
    <span
      className={`grid place-items-center overflow-hidden rounded-lg bg-sage-deep text-[1.25rem] leading-none ${className ?? ""}`}
      aria-hidden
    >
      🐔
    </span>
  );
}
