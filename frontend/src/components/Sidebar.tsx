import { api } from "@/lib/api";
import { TagPill } from "./TagPill";

export async function Sidebar() {
  const tags = await api.listTags().catch(() => []);
  return (
    <aside className="w-52 flex-shrink-0 bg-stone-100 p-5 border-l border-stone-200">
      <h3 className="text-[11px] font-bold text-stone-800 uppercase tracking-widest mb-3">Теги</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <TagPill key={t.slug} tag={t.slug} href={`/tags/${t.slug}`} />
        ))}
      </div>
    </aside>
  );
}
