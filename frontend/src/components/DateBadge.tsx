interface Props {
  dateStr: string;
  size?: "md" | "lg";
}

export function DateBadge({ dateStr, size = "md" }: Props) {
  const d = new Date(dateStr);
  const day = d.getDate().toString();
  const month = d.toLocaleString("ru-RU", { month: "short" }).replace(".", "");
  const sz = size === "lg" ? 64 : 48;
  const daySz = size === "lg" ? 26 : 20;

  return (
    <div style={{
      background: "var(--accent)",
      color: "white",
      textAlign: "center",
      borderRadius: 6,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
      width: sz,
      height: sz,
    }}>
      <span style={{ fontSize: daySz, fontWeight: 700, lineHeight: 1, fontFamily: "var(--font-sans)" }}>{day}</span>
      <span style={{ fontSize: 9, textTransform: "lowercase", opacity: 0.85, marginTop: 2, fontFamily: "var(--font-sans)" }}>{month}</span>
    </div>
  );
}
