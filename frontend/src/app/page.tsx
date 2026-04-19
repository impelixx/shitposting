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

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 64px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 48 }}>
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--fg-faint)",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                }}>
                  последние статьи
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 28px" }}>
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

        <Sidebar />
      </div>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px 32px",
        fontSize: 12,
        color: "var(--fg-faint)",
        fontFamily: "var(--font-mono)",
        textAlign: "center",
      }}>
        impelix blog · go + next.js · md в репе
      </footer>
    </>
  );
}
