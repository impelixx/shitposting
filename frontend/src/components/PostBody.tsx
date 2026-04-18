"use client";
import MDPreview from "@uiw/react-markdown-preview";

interface Props {
  body: string;
}

export function PostBody({ body }: Props) {
  return (
    <div className="prose prose-stone max-w-none font-serif">
      <MDPreview source={body} style={{ backgroundColor: "transparent", fontFamily: "Georgia, serif" }} />
    </div>
  );
}
