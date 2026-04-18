import { api } from "@/lib/api";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";

interface Props {
  params: Promise<{ tag: string }>;
}

export const revalidate = 60;

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = await api.listPosts(tag).catch(() => []);

  return (
    <div className="max-w-5xl mx-auto flex min-h-screen">
      <main className="flex-1 px-7 py-6 border-r border-stone-200">
        <h2 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">Тег</h2>
        <h1 className="font-serif text-2xl font-bold text-stone-900 mb-6">#{tag}</h1>
        {posts.length === 0 && <p className="text-stone-400 text-sm">Статей с этим тегом нет.</p>}
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </main>
      <Sidebar />
    </div>
  );
}
