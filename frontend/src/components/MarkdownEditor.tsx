"use client";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function MarkdownEditor({ value, onChange }: Props) {
  return (
    <MDEditor
      value={value}
      onChange={(v) => onChange(v ?? "")}
      height={500}
      data-color-mode="light"
    />
  );
}
