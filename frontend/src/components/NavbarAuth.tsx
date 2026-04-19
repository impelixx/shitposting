"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function NavbarAuth() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(auth.isLoggedIn());
  }, []);

  const handleLogout = () => {
    auth.removeToken();
    setLoggedIn(false);
    router.push("/");
  };

  if (loggedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          href="/admin"
          style={{
            fontSize: 12,
            color: "var(--accent)",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            padding: "4px 10px",
          }}
        >
          ✍ admin
        </Link>
        <button
          onClick={handleLogout}
          style={{
            fontSize: 12,
            color: "var(--fg-dark-mute)",
            fontFamily: "var(--font-mono)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          выйти
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      style={{
        fontSize: 12,
        color: "var(--fg-dark-mute)",
        fontFamily: "var(--font-mono)",
        textDecoration: "none",
        border: "1px solid oklch(0.35 0.015 60)",
        borderRadius: 4,
        padding: "4px 12px",
        transition: "border-color 0.15s, color 0.15s",
      }}
    >
      войти →
    </Link>
  );
}
