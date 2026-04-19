"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token } = await api.login(username, password);
      auth.setToken(token);
      router.push("/admin");
    } catch {
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "#1c1917" }}>Вход</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Логин"
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
    </>
  );
}
