import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-stone-950 px-7 py-3.5">
      <div className="max-w-5xl mx-auto flex items-start justify-between">
        <div>
          <Link href="/" className="font-serif text-xl text-stone-50 font-bold leading-none">
            Мой блог
          </Link>
          <p className="text-xs text-stone-500 mt-1">Пишу обо всём что приходит в голову</p>
        </div>
        <div className="flex gap-5 text-sm text-stone-500 pt-1">
          <Link href="/" className="hover:text-orange-500 transition-colors">Статьи</Link>
          <Link href="/about" className="hover:text-orange-500 transition-colors">О блоге</Link>
        </div>
      </div>
    </nav>
  );
}
