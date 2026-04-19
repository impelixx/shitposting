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
          background: oklch(0.24 0.028 55) !important;
          border-radius: 10px !important;
          padding: 20px 24px !important;
          border: 1px solid oklch(0.32 0.03 55) !important;
          position: relative !important;
          overflow: auto !important;
        }
        .post-body .wmde-markdown pre code {
          background: transparent !important;
          color: oklch(0.93 0.018 75) !important;
          font-size: 14px !important;
          padding: 0 !important;
          font-family: var(--font-mono) !important;
          line-height: 1.7 !important;
        }
        /* syntax tokens — warm palette */
        .post-body .token.comment,.post-body .token.prolog { color: oklch(0.58 0.025 55); font-style: italic; }
        .post-body .token.string,.post-body .token.char,.post-body .token.inserted { color: oklch(0.75 0.14 140); }
        .post-body .token.number,.post-body .token.boolean { color: oklch(0.72 0.15 50); }
        .post-body .token.keyword,.post-body .token.attr-value { color: oklch(0.72 0.16 265); }
        .post-body .token.function,.post-body .token.class-name { color: oklch(0.76 0.16 55); }
        .post-body .token.operator,.post-body .token.punctuation { color: oklch(0.72 0.02 65); }
        .post-body .token.property,.post-body .token.tag { color: oklch(0.68 0.18 25); }
        .post-body .token.attr-name,.post-body .token.selector { color: oklch(0.74 0.12 85); }
        .post-body .token.variable,.post-body .token.regex { color: oklch(0.78 0.14 75); }
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
