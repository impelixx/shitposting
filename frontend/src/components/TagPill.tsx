import Link from "next/link";

interface Props {
  tag: string;
  href?: string;
  variant?: "orange" | "amber";
}

export function TagPill({ tag, href, variant = "orange" }: Props) {
  const style: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    background: variant === "amber" ? "var(--amber-bg)" : "var(--accent-bg)",
    color: variant === "amber" ? "oklch(0.45 0.12 60)" : "var(--rust)",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    fontFamily: "var(--font-sans)",
  };

  if (href) return <Link href={href} style={style}>#{tag}</Link>;
  return <span style={style}>#{tag}</span>;
}
