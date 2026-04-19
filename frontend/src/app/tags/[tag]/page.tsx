import { Navbar } from "@/components/Navbar";
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
    <>
      <Navbar />
      <div style={{ maxWidth: "1024px", margin: "0 auto", display: "flex", minHeight: "100vh" }}>
        <main style={{ flex: 1, padding: "24px 28px", borderRight: "1px solid #e7e5e4" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Тег</p>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1c1917", marginBottom: "24px" }}>#{tag}</h1>
          {posts.length === 0 && <p style={{ color: "#a8a29e", fontSize: "14px" }}>Статей с этим тегом нет.</p>}
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </main>
        <Sidebar />
      </div>
    </>
  );
}
