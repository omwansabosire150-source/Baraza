"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    imageUrl: string | null;
    slug: string;
    store: { id: string; name: string; slug: string };
  };
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);

  async function load() {
    const res = await fetch("/api/cart");
    const body = await res.json();
    setItems(body.cart?.items ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(itemId: string, quantity: number) {
    if (quantity < 1) return;
    await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    load();
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    load();
  }

  if (items === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-ink/50">Loading your cart…</p>
      </div>
    );
  }

  const total = items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const currency = items[0]?.product.currency ?? "USD";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 font-display text-2xl font-semibold">Your cart</h1>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="mb-4 text-ink/60">Your cart is empty.</p>
          <Link href="/marketplace" className="btn-primary">Browse the marketplace</Link>
        </div>
      ) : (
        <>
          <div className="card divide-y divide-line">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div
                  className="h-16 w-16 flex-shrink-0 rounded bg-paper bg-cover bg-center"
                  style={item.product.imageUrl ? { backgroundImage: `url(${item.product.imageUrl})` } : {}}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-ink/50">{item.product.store.name}</p>
                  <p className="font-mono text-sm text-teal-dark">
                    {formatPrice(item.product.priceCents, item.product.currency)}
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  className="field-input w-16"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="font-mono text-lg font-medium">
              Total: {formatPrice(total, currency)}
            </p>
            <button onClick={() => router.push("/checkout")} className="btn-primary">
              Proceed to checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
