interface Props {
  dateStr: string;
}

export function DateBadge({ dateStr }: Props) {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("ru-RU", { month: "short" });
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "#f97316",
      borderRadius: "7px",
      padding: "6px 10px",
      minWidth: "42px",
      flexShrink: 0,
      textAlign: "center",
    }}>
      <span style={{ fontSize: "18px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{day}</span>
      <span style={{ fontSize: "9px", color: "#ffedd5", textTransform: "uppercase", marginTop: "2px" }}>{month}</span>
    </div>
  );
}
