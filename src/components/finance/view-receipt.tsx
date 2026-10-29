export function ViewReceipt({
  href,
  label = "View receipt",
}: {
  href: string;
  label?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm font-medium text-sage hover:text-sage-deep"
    >
      {label}
    </a>
  );
}
