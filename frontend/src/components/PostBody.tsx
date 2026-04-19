"use client";
import MDPreview from "@uiw/react-markdown-preview";

const MONO = "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace";

interface Props {
  body: string;
}

export function PostBody({ body }: Props) {
  return (
    <div>
      <MDPreview source={body} style={{ backgroundColor: "transparent", fontFamily: MONO }} />
    </div>
  );
}
