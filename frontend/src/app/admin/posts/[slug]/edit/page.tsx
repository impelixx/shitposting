"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Post } from "@/lib/types";
import { PostForm } from "@/components/PostForm";

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    api.getPost(slug).then(setPost).catch(console.error);
  }, [slug]);

  if (!post) return <div className="p-8 text-stone-400">Загрузка...</div>;
  return <PostForm initialPost={post} />;
}
