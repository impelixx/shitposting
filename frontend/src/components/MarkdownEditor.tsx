"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const MONO = "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface Props {
  value: string;
  onChange: (v: string) => void;
  token?: string;
  height?: number;
}

export function MarkdownEditor({ value, onChange, token, height = 560 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!token) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((it) => it.type.startsWith("image/"));
      if (!imageItem) return;

      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${BASE}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (res.ok) {
          const { url } = await res.json();
          const md = `![image](${url})`;
          const textarea = wrapper.querySelector("textarea");
          const cur = valueRef.current;
          if (textarea) {
            const start = textarea.selectionStart ?? cur.length;
            const end = textarea.selectionEnd ?? cur.length;
            const next = cur.slice(0, start) + md + cur.slice(end);
            onChangeRef.current(next);
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + md.length;
              textarea.focus();
            }, 0);
          } else {
            onChangeRef.current(cur + "\n" + md + "\n");
          }
        } else {
          setUploadError("Ошибка загрузки");
          setTimeout(() => setUploadError(""), 3000);
        }
      } finally {
        setUploading(false);
      }
    };

    wrapper.addEventListener("paste", handlePaste);
    return () => wrapper.removeEventListener("paste", handlePaste);
  }, [token]);

  const extraCommands = useMemo(() => {
    if (!token) return [];
    return [
      {
        name: "upload-image",
        keyCommand: "upload-image",
        buttonProps: { title: "Вставить изображение", style: { color: "#a8a29e", fontSize: "13px" } },
        icon: <span>⬆</span>,
        execute(_state: unknown, mdApi: { replaceSelection: (t: string) => void }) {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".jpg,.jpeg,.png,.webp,.gif";
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
              const form = new FormData();
              form.append("file", file);
              const res = await fetch(`${BASE}/api/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
              });
              if (res.ok) {
                const { url } = await res.json();
                const alt = file.name.replace(/\.[^.]+$/, "");
                mdApi.replaceSelection(`![${alt}](${url})`);
              } else {
                setUploadError("Ошибка загрузки");
                setTimeout(() => setUploadError(""), 3000);
              }
            } finally {
              setUploading(false);
            }
          };
          input.click();
        },
      },
    ];
  }, [token]);

  return (
    <div ref={wrapperRef} style={{ fontFamily: MONO, border: "1px solid #e7e5e4", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
      <style>{`
        .w-md-editor { border: none !important; border-radius: 0 !important; box-shadow: none !important; font-family: ${MONO} !important; }
        .w-md-editor-toolbar { background: #1c1917 !important; border-bottom: 1px solid #44403c !important; border-radius: 0 !important; padding: 6px 10px !important; }
        .w-md-editor-toolbar li > button { color: #78716c !important; border-radius: 4px !important; transition: color 0.15s, background 0.15s !important; }
        .w-md-editor-toolbar li > button:hover { color: #f97316 !important; background: #292524 !important; }
        .w-md-editor-toolbar li.active > button { color: #f97316 !important; }
        .w-md-editor-toolbar-divider { background: #44403c !important; width: 1px !important; margin: 4px 6px !important; }
        .w-md-editor-content { background: #ffffff !important; }
        .w-md-editor-text, .w-md-editor-text-input, .w-md-editor-text-pre > code {
          font-family: ${MONO} !important; font-size: 14px !important; line-height: 1.75 !important; color: #1c1917 !important;
        }
        .w-md-editor-preview { background: #fafaf9 !important; border-left: 1px solid #e7e5e4 !important; }
        .wmde-markdown { font-family: ${MONO} !important; font-size: 14px !important; background: transparent !important; color: #1c1917 !important; line-height: 1.75 !important; }
        .wmde-markdown h1, .wmde-markdown h2, .wmde-markdown h3 { border-bottom: 1px solid #e7e5e4 !important; font-family: ${MONO} !important; }
        .wmde-markdown code { background: #f5f5f4 !important; color: #c2410c !important; border-radius: 3px !important; padding: 1px 5px !important; }
        .wmde-markdown pre { background: #1c1917 !important; border-radius: 6px !important; }
        .wmde-markdown pre code { background: transparent !important; color: #e7e5e4 !important; }
        .wmde-markdown blockquote { border-left: 3px solid #f97316 !important; color: #78716c !important; }
        .wmde-markdown img { max-width: 100% !important; border-radius: 6px !important; margin: 8px 0 !important; }
        .w-md-editor-bar svg { color: #44403c !important; }
      `}</style>

      {uploading && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(28,25,23,0.4)", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "#f97316", fontSize: "13px", fontFamily: MONO }}>загружаю...</span>
        </div>
      )}

      {uploadError && (
        <div style={{
          position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)",
          background: "#1c1917", color: "#f87171", fontSize: "12px",
          padding: "6px 14px", borderRadius: "6px", zIndex: 11, fontFamily: MONO,
        }}>
          {uploadError}
        </div>
      )}

      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={height}
        data-color-mode="light"
        extraCommands={extraCommands as never[]}
      />
    </div>
  );
}
