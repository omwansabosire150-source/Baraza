"use client";

import { useState } from "react";

export default function ConnectStripeButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't start Stripe onboarding");
      setLoading(false);
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div>
      <button onClick={onClick} disabled={loading} className="btn-primary">
        {loading ? "Redirecting to Stripe…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
