"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  productId,
  maxQty,
}: {
  productId: string;
  maxQty: number;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");

  async function addToCart() {
    setStatus("adding");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStatus("added");
    router.refresh();
  }

  if (maxQty === 0) {
    return <p className="text-sm text-ink/50">Out of stock</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="field-input w-20"
      >
        {Array.from({ length: Math.min(maxQty, 10) }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button onClick={addToCart} disabled={status === "adding"} className="btn-primary">
        {status === "adding" ? "Adding…" : status === "added" ? "Added ✓" : "Add to cart"}
      </button>
      {status === "error" && <span className="text-sm text-red-600">Couldn't add that</span>}
    </div>
  );
}
