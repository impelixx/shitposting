import { api } from "@/lib/api";
import { TagPill } from "./TagPill";
import { RandomPostButton } from "./RandomPostButton";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "var(--fg-faint)",
      fontWeight: 600,
      marginBottom: 12,
      fontFamily: "var(--font-sans)",
    }}>
      {children}
    </div>
  );
}

function StatsCard({ totalPosts, totalViews, totalComments }: {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
}) {
  const items = [
    { label: "статей", value: totalPosts },
    { label: "просмотров", value: totalViews },
    { label: "комментариев", value: totalComments },
  ];
  return (
    <div>
      <SectionLabel>статистика</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
      }}>
        {items.map(({ label, value }) => (
          <div key={label} style={{
            background: "var(--bg-sunken)",
            borderRadius: 8,
            padding: "12px 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--accent)",
              lineHeight: 1,
            }}>
              {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            </span>
            <span style={{
              fontSize: 10,
              color: "var(--fg-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Heatmap({ postsPerDay }: { postsPerDay: { day: string; count: number }[] }) {
  const weeks = 16;
  const days = 7;
  const totalCells = weeks * days;

  // Build a map of date → count
  const map: Record<string, number> = {};
  for (const { day, count } of postsPerDay) {
    map[day] = count;
  }

  // Generate last `totalCells` days from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: { date: string; count: number }[] = [];
  for (let i = totalCells - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: map[key] ?? 0 });
  }

  const maxCount = Math.max(1, ...cells.map((c) => c.count));

  const heatColor = (count: number) => {
    if (count === 0) return "var(--bg-sunken)";
    const ratio = count / maxCount;
    if (ratio < 0.34) return "oklch(0.88 0.08 65)";
    if (ratio < 0.67) return "oklch(0.78 0.14 55)";
    return "oklch(0.65 0.18 50)";
  };

  // Arrange into weeks×days grid (column = week, row = day-of-week)
  const grid: { date: string; count: number }[][] = Array.from({ length: weeks }, (_, w) =>
    cells.slice(w * days, w * days + days)
  );

  return (
    <div>
      <SectionLabel>календарь публикаций</SectionLabel>
      <div style={{ display: "flex", gap: 3 }}>
        {grid.map((week, w) => (
          <div key={w} style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {week.map((cell) => (
              <div
                key={cell.date}
                title={cell.count > 0 ? `${cell.date}: ${cell.count} пост(а)` : cell.date}
                style={{
                  aspectRatio: "1",
                  background: heatColor(cell.count),
                  borderRadius: 2,
                  cursor: cell.count > 0 ? "default" : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 8, fontSize: 10, color: "var(--fg-faint)", fontFamily: "var(--font-mono)",
      }}>
        <span>16 нед</span>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {[0, 1, 2, 3].map(l => {
            const colors = ["var(--bg-sunken)", "oklch(0.88 0.08 65)", "oklch(0.78 0.14 55)", "oklch(0.65 0.18 50)"];
            return <div key={l} style={{ width: 8, height: 8, background: colors[l], borderRadius: 2 }} />;
          })}
        </div>
      </div>
    </div>
  );
}

export async function Sidebar() {
  const [tags, stats] = await Promise.all([
    api.listTags().catch(() => []),
    api.getStats().catch(() => ({ total_posts: 0, total_views: 0, total_comments: 0, posts_per_day: [] })),
  ]);

  return (
    <aside style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 32, paddingTop: 4 }}>
      <StatsCard
        totalPosts={stats.total_posts}
        totalViews={stats.total_views}
        totalComments={stats.total_comments}
      />
      <Heatmap postsPerDay={stats.posts_per_day} />

      <div>
        <SectionLabel>теги</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map((t, i) => (
            <TagPill key={t.slug} tag={t.slug} href={`/tags/${t.slug}`} variant={i % 3 === 1 ? "amber" : "orange"} />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>случайная</SectionLabel>
        <RandomPostButton />
      </div>
    </aside>
  );
}
