import Link from "next/link";
import type { ReactNode } from "react";
import { NavbarAuth } from "@/components/NavbarAuth";

interface Props {
  children?: ReactNode;
}

export function Navbar({ children }: Props) {
  return (
    <header style={{ background: "var(--bg-dark)", color: "var(--fg-dark)", padding: "16px 20px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="navbar-row">
          <Link href="/" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>🏝️</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 17, color: "var(--fg-dark)" }}>
              impelix blog
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <nav className="navbar-nav" style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--fg-dark-mute)" }}>
              <Link href="/" style={{ color: "var(--fg-dark)" }}>Статьи</Link>
              <Link href="/about" style={{ color: "var(--fg-dark-mute)" }}>О блоге</Link>
            </nav>
            <NavbarAuth />
          </div>
        </div>
        <div className="navbar-desc">
          То, что не поместилось в канал знатока, но написать надо
        </div>
        {children}
      </div>
    </header>
  );
}
