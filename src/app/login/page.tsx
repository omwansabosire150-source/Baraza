"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      const session = await getSession();
      const role = (session?.user as any)?.role;
      setLoading(false);
      router.push(role === "MERCHANT" ? "/dashboard" : "/marketplace");
    } else {
      setLoading(false);
      setError("Incorrect email or password");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-teal">Baraza</p>
      <h1 className="mb-1 font-display text-2xl font-semibold">Welcome back</h1>
      <p className="mb-8 text-sm text-ink/60">Log in to manage your store.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className="field-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className="field-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        New to Baraza?{" "}
        <Link href="/register" className="font-medium text-teal-dark underline">
          Open a store
        </Link>
      </p>
      <p className="mt-2 text-xs text-ink/40">
        Demo account: demo@baraza.market / password123 (after running the seed script)
      </p>
    </main>
  );
}
