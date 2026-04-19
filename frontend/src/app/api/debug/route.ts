import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080 (fallback)";
  const url = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/posts?limit=1`;

  let status: number | null = null;
  let body: unknown = null;
  let error: string | null = null;

  try {
    const res = await fetch(url, { cache: "no-store" });
    status = res.status;
    body = await res.json().catch(() => null);
  } catch (e) {
    error = String(e);
  }

  return NextResponse.json({ base, url, status, body, error });
}
