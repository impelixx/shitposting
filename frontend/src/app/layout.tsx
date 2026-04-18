import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Мой блог",
  description: "Пишу обо всём что приходит в голову",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
