import { api } from "@/lib/api";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await api.listPosts().catch(() => []);

  return (
    <>
      <div className="bg-stone-950 px-7 pb-3">
        <div className="max-w-5xl mx-auto">
          <SearchBar />
        </div>
      </div>
      <div className="max-w-5xl mx-auto flex min-h-screen">
        <main className="flex-1 px-7 py-6 border-r border-stone-200">
          <h2 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-5">
            Последние статьи
          </h2>
          {posts.length === 0 && (
            <p className="text-stone-400 text-sm">Статей пока нет.</p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </main>
        <Sidebar />
      </div>
    </>
  );
}
