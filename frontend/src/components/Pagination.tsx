import Link from "next/link";

interface Props {
  page: number;
  hasNext: boolean;
  basePath: string;
  tag?: string;
}

const MONO = "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace";

export function Pagination({ page, hasNext, basePath, tag }: Props) {
  if (page === 0 && !hasNext) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (p > 0) params.set("page", String(p));
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      padding: "24px 0 8px",
      fontFamily: MONO,
      fontSize: "12px",
    }}>
      {page > 0 ? (
        <Link href={buildHref(page - 1)} style={{ color: "#f97316", textDecoration: "none" }}>
          ← назад
        </Link>
      ) : (
        <span style={{ color: "#e7e5e4" }}>← назад</span>
      )}

      <span style={{ color: "#78716c" }}>стр. {page + 1}</span>

      {hasNext ? (
        <Link href={buildHref(page + 1)} style={{ color: "#f97316", textDecoration: "none" }}>
          вперёд →
        </Link>
      ) : (
        <span style={{ color: "#e7e5e4" }}>вперёд →</span>
      )}
    </div>
  );
}
