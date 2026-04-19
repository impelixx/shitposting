import { Comment } from "@/lib/types";

interface Props {
  comments: Comment[];
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <p style={{ fontSize: 14, color: "var(--fg-faint)", fontFamily: "var(--font-mono)", marginBottom: 24 }}>
        Комментариев пока нет. Будьте первым!
      </p>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: 16 }}>
      {comments.map((c, i) => (
        <li key={c.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `oklch(0.7 0.15 ${50 + i * 30})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
              textTransform: "uppercase",
            }}
          >
            {c.author.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--fg)" }}>{c.author}</span>
              <span style={{ fontSize: 11, color: "var(--fg-faint)", fontFamily: "var(--font-mono)" }}>
                {formatDate(c.created_at)}
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--fg-mute)", margin: 0 }}>{c.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
