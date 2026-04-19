import Link from "next/link";

export function Navbar() {
  return (
    <nav style={{ backgroundColor: "#1c1917" }} className="px-7 py-3.5">
      <div className="max-w-5xl mx-auto flex items-start justify-between">
        <div>
          <Link
            href="/"
            style={{ fontFamily: "Georgia, serif", color: "#fafaf9" }}
            className="text-xl font-bold leading-none"
          >
            Мой блог
          </Link>
          <p style={{ color: "#78716c" }} className="text-xs mt-1">
            Пишу обо всём что приходит в голову
          </p>
        </div>
        <div className="flex gap-5 text-sm pt-1" style={{ color: "#78716c" }}>
          <Link href="/" className="hover:text-orange-500 transition-colors">
            Статьи
          </Link>
          <Link href="/about" className="hover:text-orange-500 transition-colors">
            О блоге
          </Link>
        </div>
      </div>
    </nav>
  );
}
