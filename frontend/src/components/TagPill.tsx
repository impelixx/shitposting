import Link from "next/link";

interface Props {
  tag: string;
  href?: string;
}

export function TagPill({ tag, href }: Props) {
  const cls = "bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full hover:bg-orange-200 transition-colors";
  if (href) {
    return <Link href={href} className={cls}>#{tag}</Link>;
  }
  return <span className={cls}>#{tag}</span>;
}
