import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";

export const revalidate = 0;

export default async function HomePage() {
  const posts = await api.listPosts(undefined, 50, 0).catch(() => []);
  const featured = posts[0] ?? null;
  const grid = posts.slice(1);

  return (
    <>
      <Navbar>
        <SearchBar />
      </Navbar>

      <div className="home-layout">
        <main>
          {featured && (
            <section style={{ marginBottom: 56 }}>
              <div style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--fg-faint)",
                fontWeight: 600,
                marginBottom: 16,
                fontFamily: "var(--font-sans)",
              }}>
                избранное
              </div>
              <PostCard post={featured} featured />
            </section>
          )}

          {grid.length > 0 && (
            <section>
              <div style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--fg-faint)",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                marginBottom: 16,
              }}>
                последние статьи
              </div>
              <div className="posts-grid">
                {grid.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {posts.length === 0 && (
            <p style={{ color: "var(--fg-faint)", fontSize: 14, fontFamily: "var(--font-mono)" }}>
              {"// статей пока нет"}
            </p>
          )}
        </main>

        <div className="home-sidebar">
          <Sidebar />
        </div>
      </div>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px 32px",
        fontSize: 12,
        color: "var(--fg-faint)",
        fontFamily: "var(--font-mono)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span>impelix blog · go + next.js · md в репе</span>
      </footer>
    </>
  );
}
