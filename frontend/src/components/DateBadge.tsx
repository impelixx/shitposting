interface Props {
  dateStr: string;
}

export function DateBadge({ dateStr }: Props) {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("ru-RU", { month: "short" });
  return (
    <div className="flex flex-col items-center bg-orange-500 rounded-lg px-2.5 py-1.5 min-w-[42px] flex-shrink-0">
      <span className="text-lg font-black text-white leading-none">{day}</span>
      <span className="text-[9px] text-orange-100 uppercase mt-0.5">{month}</span>
    </div>
  );
}
