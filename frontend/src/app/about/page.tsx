import { Navbar } from "@/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div
        style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}
      >
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "30px",
            fontWeight: 700,
            color: "#1c1917",
            marginBottom: "24px",
          }}
        >
          О блоге
        </h1>
        <div
          style={{
            fontFamily: "Georgia, serif",
            color: "#78716c",
            lineHeight: 1.8,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p>
            Здесь я пишу, что то более длинное и осмысленное, что не вмешается в
            рамки одного поста в канале знатока + иногда что то более
            профессиональное
          </p>
          <p>
            Но общей темы для этого сайта нет, что приходит в голову то и пишу
          </p>
        </div>
      </div>
    </>
  );
}
