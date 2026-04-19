import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Мой блог",
  description: "Пишу обо всём что приходит в голову",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
