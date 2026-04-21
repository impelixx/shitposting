"use client";
import MDPreview from "@uiw/react-markdown-preview";
import React from "react";

const CODE_BG = "oklch(0.24 0.028 55)";
const CODE_BORDER = "1px solid oklch(0.32 0.03 55)";

function CodePre({ children, className, style, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  // Find language from first code child's className
  const code = React.Children.toArray(children).find(
    (c): c is React.ReactElement<{ className?: string }> => React.isValidElement(c)
  );
  const lang =
    (code?.props?.className ?? "").match(/language-(\w+)/)?.[1] ??
    (className ?? "").match(/language-(\w+)/)?.[1] ??
    "";

  return (
    <pre
      className={className}
      {...props}
      style={{
        background: CODE_BG,
        borderRadius: 10,
        padding: "20px 24px",
        paddingTop: lang ? 40 : 20,
        border: CODE_BORDER,
        position: "relative",
        overflowX: "auto",
        margin: "20px 0",
        ...style,
      }}
    >
      {lang && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "oklch(0.72 0.12 55)",
            background: "oklch(0.30 0.03 55)",
            padding: "2px 8px",
            borderRadius: 4,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {lang}
        </span>
      )}
      {children}
    </pre>
  );
}

export function PostBody({ body }: { body: string }) {
  return (
    <>
      <style>{`
        .post-body .wmde-markdown {
          background: transparent !important;
          color: var(--fg) !important;
          font-family: var(--font-sans) !important;
          font-size: 17px !important;
          line-height: 1.85 !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          min-width: 0 !important;
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
        /* inline code */
        .post-body .wmde-markdown :not(pre) > code {
          background: var(--accent-bg) !important;
          color: var(--rust) !important;
          font-family: var(--font-mono) !important;
          border-radius: 3px !important;
          padding: 2px 6px !important;
          font-size: 14px !important;
        }
        /* code inside pre — reset to our palette */
        .post-body .wmde-markdown pre code {
          background: transparent !important;
          color: oklch(0.93 0.018 75) !important;
          font-size: 14px !important;
          padding: 0 !important;
          font-family: var(--font-mono) !important;
          line-height: 1.7 !important;
          border-radius: 0 !important;
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
        /* copy button from wmde */
        .post-body .wmde-markdown .copied {
          position: absolute !important;
          top: 8px !important;
          left: 14px !important;
          opacity: 0.5 !important;
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
        .post-body .wmde-markdown table { border-collapse: collapse !important; width: 100% !important; display: block !important; overflow-x: auto !important; }
        .post-body .wmde-markdown th,
        .post-body .wmde-markdown td { border: 1px solid var(--border) !important; padding: 8px 12px !important; }
        .post-body .wmde-markdown th { background: var(--bg-sunken, oklch(0.96 0.014 80)) !important; font-weight: 600 !important; }
        /* images: transparent bg, blend so white areas match cream page */
        .post-body .wmde-markdown img {
          max-width: 100% !important;
          border-radius: 6px !important;
          background: transparent !important;
          mix-blend-mode: multiply !important;
        }
        .post-body .wmde-markdown hr { border-top: 1px solid var(--border) !important; border-bottom: none !important; }
      `}</style>
      <div className="post-body" data-color-mode="light">
        <MDPreview
          source={body}
          style={{ backgroundColor: "transparent" }}
          components={{ pre: CodePre as React.FC<React.HTMLAttributes<HTMLPreElement>> }}
        />
      </div>
    </>
  );
}
