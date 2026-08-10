"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: "SHIPPED" | "DELIVERED") {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't update this order");
      return;
    }
    router.refresh();
  }

  if (status === "PAID") {
    return (
      <div>
        <button onClick={() => updateStatus("SHIPPED")} disabled={loading} className="btn-secondary">
          {loading ? "Updating…" : "Mark as shipped"}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (status === "SHIPPED") {
    return (
      <div>
        <button onClick={() => updateStatus("DELIVERED")} disabled={loading} className="btn-primary">
          {loading ? "Releasing payment…" : "Mark delivered & release payment"}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return null;
}
