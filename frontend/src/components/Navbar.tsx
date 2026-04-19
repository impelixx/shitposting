import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export function Navbar({ children }: Props) {
  return (
    <nav style={{ backgroundColor: "#1c1917", padding: "14px 28px" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <Link
            href="/"
            style={{ fontFamily: "Georgia, serif", color: "#fafaf9", fontSize: "22px", fontWeight: 700, lineHeight: 1, textDecoration: "none", display: "block" }}
          >
            🏝️ Мой блог
          </Link>
          <p style={{ color: "#78716c", fontSize: "12px", marginTop: "4px" }}>
            Пишу обо всём что приходит в голову
          </p>
          {children}
        </div>
        <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#78716c", paddingTop: "4px" }}>
          <Link href="/" style={{ color: "#78716c", textDecoration: "none" }} className="hover:text-orange-500 transition-colors">Статьи</Link>
          <Link href="/about" style={{ color: "#78716c", textDecoration: "none" }} className="hover:text-orange-500 transition-colors">О блоге</Link>
        </div>
      </div>
    </nav>
  );
}
