"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "MERCHANT" ? "MERCHANT" : "BUYER";

  const [role, setRole] = useState<"BUYER" | "MERCHANT">(initialRole);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    if (signInResult?.ok) {
      router.push(role === "MERCHANT" ? "/dashboard/store" : "/marketplace");
    } else {
      router.push("/login");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-teal">Baraza</p>
      <h1 className="mb-1 font-display text-2xl font-semibold">Create your account</h1>
      <p className="mb-6 text-sm text-ink/60">
        Tell us what you're here to do — you can always do the other later.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("BUYER")}
          className={`rounded-md border px-4 py-3 text-left text-sm transition ${
            role === "BUYER" ? "border-teal bg-teal-light" : "border-line bg-surface"
          }`}
        >
          <span className="block font-medium">Shop</span>
          <span className="text-xs text-ink/60">Browse and buy from stores</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("MERCHANT")}
          className={`rounded-md border px-4 py-3 text-left text-sm transition ${
            role === "MERCHANT" ? "border-teal bg-teal-light" : "border-line bg-surface"
          }`}
        >
          <span className="block font-medium">Sell</span>
          <span className="text-xs text-ink/60">Open a storefront</span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="name">Your name</label>
          <input
            id="name"
            required
            className="field-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
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
            minLength={8}
            className="field-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : role === "MERCHANT" ? "Open your store" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Already on Baraza?{" "}
        <Link href="/login" className="font-medium text-teal-dark underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
