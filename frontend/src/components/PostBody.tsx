"use client";
import MDPreview from "@uiw/react-markdown-preview";

export function PostBody({ body }: { body: string }) {
  return (
    <>
      <style>{`
        .post-body { /* reset */ }
        .post-body .wmde-markdown {
          background: transparent !important;
          color: var(--fg) !important;
          font-family: var(--font-sans) !important;
          font-size: 17px !important;
          line-height: 1.85 !important;
        }
        .post-body .wmde-markdown h1,
        .post-body .wmde-markdown h2,
        .post-body .wmde-markdown h3,
        .post-body .wmde-markdown h4 {
          font-family: var(--font-serif) !important;
          font-weight: 600 !important;
          color: var(--fg) !important;
          border-bottom: 1px solid var(--border) !important;
          padding-bottom: 6px !important;
          margin: 1.6em 0 0.8em !important;
          line-height: 1.25 !important;
          letter-spacing: -0.01em !important;
        }
        .post-body .wmde-markdown h1 { font-size: 26px !important; letter-spacing: -0.02em !important; }
        .post-body .wmde-markdown h2 { font-size: 22px !important; }
        .post-body .wmde-markdown h3 { font-size: 18px !important; }
        .post-body .wmde-markdown p { margin-bottom: 1.2em !important; }
        .post-body .wmde-markdown a { color: var(--accent) !important; }
        .post-body .wmde-markdown code {
          background: var(--accent-bg) !important;
          color: var(--rust) !important;
          font-family: var(--font-mono) !important;
          border-radius: 3px !important;
          padding: 2px 6px !important;
          font-size: 14px !important;
        }
        .post-body .wmde-markdown pre {
          background: var(--bg-dark, oklch(0.18 0.012 60)) !important;
          border-radius: 8px !important;
          padding: 20px !important;
        }
        .post-body .wmde-markdown pre code {
          background: transparent !important;
          color: oklch(0.94 0.008 80) !important;
          font-size: 14px !important;
          padding: 0 !important;
        }
        .post-body .wmde-markdown blockquote {
          border-left: 3px solid var(--accent) !important;
          color: var(--fg-mute) !important;
          padding-left: 16px !important;
          margin: 16px 0 !important;
          background: transparent !important;
        }
        .post-body .wmde-markdown ul,
        .post-body .wmde-markdown ol { padding-left: 24px !important; margin-bottom: 1.2em !important; }
        .post-body .wmde-markdown table { border-collapse: collapse !important; width: 100% !important; }
        .post-body .wmde-markdown th,
        .post-body .wmde-markdown td { border: 1px solid var(--border) !important; padding: 8px 12px !important; }
        .post-body .wmde-markdown th { background: var(--bg-sunken, oklch(0.96 0.014 80)) !important; font-weight: 600 !important; }
        .post-body .wmde-markdown img { max-width: 100% !important; border-radius: 6px !important; }
        .post-body .wmde-markdown hr { border-top: 1px solid var(--border) !important; border-bottom: none !important; }
      `}</style>
      <div className="post-body" data-color-mode="light">
        <MDPreview source={body} style={{ backgroundColor: "transparent" }} />
      </div>
    </>
  );
}
