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

function ArtPattern() {
  return (
    <div style={{
      width: "100%",
      aspectRatio: "1",
      borderRadius: 8,
      overflow: "hidden",
      position: "relative",
      background: "var(--bg-sunken)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
        {[20, 40, 60, 80, 100].map((r, i) => (
          <circle
            key={r}
            cx="100" cy="100" r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5 - i * 0.2}
            opacity={0.15 + i * 0.08}
          />
        ))}
        <circle cx="100" cy="100" r="10" fill="var(--accent)" opacity="0.6" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = 100 + Math.cos(angle) * 85;
          const y = 100 + Math.sin(angle) * 85;
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" opacity="0.25" />;
        })}
      </svg>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", opacity: 0.7, zIndex: 1 }}>impelix</span>
    </div>
  );
}

function Heatmap() {
  const weeks = 16, days = 7;
  const cells: number[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < weeks * days; i++) {
    const v = rand();
    let level = 0;
    if (v > 0.6) level = 1;
    if (v > 0.82) level = 2;
    if (v > 0.94) level = 3;
    cells.push(level);
  }

  const heatColor = (lvl: number) => {
    if (lvl === 0) return "var(--bg-sunken)";
    if (lvl === 1) return "oklch(0.88 0.08 65)";
    if (lvl === 2) return "oklch(0.78 0.14 55)";
    return "oklch(0.65 0.18 50)";
  };

  return (
    <div>
      <SectionLabel>календарь публикаций</SectionLabel>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {Array.from({ length: days }).map((_, d) => (
              <div
                key={d}
                style={{
                  aspectRatio: "1",
                  background: heatColor(cells[w * days + d]),
                  borderRadius: 2,
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
          {[0, 1, 2, 3].map(l => (
            <div key={l} style={{ width: 8, height: 8, background: heatColor(l), borderRadius: 2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function Sidebar() {
  const tags = await api.listTags().catch(() => []);

  return (
    <aside style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 32, paddingTop: 4 }}>
      <ArtPattern />
      <Heatmap />

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
