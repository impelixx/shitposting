import { api } from "@/lib/api";
import { TagPill } from "./TagPill";

export async function Sidebar() {
  const tags = await api.listTags().catch(() => []);
  return (
    <aside style={{
      width: "220px",
      flexShrink: 0,
      backgroundColor: "#f5f5f4",
      padding: "24px 18px",
      borderLeft: "1px solid #e7e5e4",
    }}>
      <h3 style={{
        fontSize: "11px",
        fontWeight: 700,
        color: "#1c1917",
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        marginBottom: "12px",
      }}>
        Теги
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {tags.map((t) => (
          <TagPill key={t.slug} tag={t.slug} href={`/tags/${t.slug}`} />
        ))}
      </div>
    </aside>
  );
}
