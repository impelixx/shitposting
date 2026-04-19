import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";

export const revalidate = 0;

const PAGE_SIZE = 10;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(0, parseInt(pageStr ?? "0") || 0);

  const raw = await api.listPosts(undefined, PAGE_SIZE + 1, page * PAGE_SIZE).catch(() => []);
  const hasNext = raw.length > PAGE_SIZE;
  const posts = raw.slice(0, PAGE_SIZE);

  return (
    <>
      <Navbar>
        <SearchBar />
      </Navbar>
      <div style={{ maxWidth: "1024px", margin: "0 auto", display: "flex", minHeight: "100vh" }}>
        <main style={{ flex: 1, padding: "24px 28px", borderRight: "1px solid #e7e5e4" }}>
          <h2 style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#78716c",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: "20px",
          }}>
            Последние статьи
          </h2>
          {posts.length === 0 && (
            <p style={{ color: "#a8a29e", fontSize: "14px" }}>Статей пока нет.</p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <Pagination page={page} hasNext={hasNext} basePath="/" />
        </main>
        <Sidebar />
      </div>
    </>
  );
}
