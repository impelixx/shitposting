import Link from "next/link";

interface Props {
  tag: string;
  href?: string;
}

const style = {
  backgroundColor: "#ffedd5",
  color: "#c2410c",
  fontSize: "11px",
  padding: "2px 10px",
  borderRadius: "20px",
  textDecoration: "none",
  display: "inline-block",
};

export function TagPill({ tag, href }: Props) {
  if (href) {
    return <Link href={href} style={style}>#{tag}</Link>;
  }
  return <span style={style}>#{tag}</span>;
}
