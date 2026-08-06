"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductData = {
  name: string;
  description: string;
  imageUrl: string;
  price: string; // dollars, as typed
  currency: string;
  sku: string;
  stockQty: number;
  condition: "new" | "used" | "refurbished";
  isActive: boolean;
};

export default function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: Partial<ProductData> & { priceCents?: number };
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductData>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    price: initial?.priceCents ? (initial.priceCents / 100).toFixed(2) : "",
    currency: initial?.currency ?? "USD",
    sku: initial?.sku ?? "",
    stockQty: initial?.stockQty ?? 0,
    condition: initial?.condition ?? "new",
    isActive: initial?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProductData>(key: K, value: ProductData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceCents = Math.round(parseFloat(form.price || "0") * 100);
    if (Number.isNaN(priceCents) || priceCents < 0) {
      setError("Enter a valid price");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      priceCents,
      currency: form.currency,
      sku: form.sku,
      stockQty: Number(form.stockQty),
      condition: form.condition,
      isActive: form.isActive,
    };

    const res = await fetch(productId ? `/api/products/${productId}` : "/api/products", {
      method: productId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save this product");
      return;
    }
    router.push("/dashboard/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <div>
        <label className="field-label">Product name</label>
        <input
          required
          className="field-input"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Description</label>
        <textarea
          className="field-input"
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Image URL</label>
        <input
          className="field-input"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Price</label>
          <div className="flex">
            <span className="flex items-center rounded-l-md border border-r-0 border-line bg-paper px-3 font-mono text-sm text-ink/60">
              {form.currency}
            </span>
            <input
              required
              inputMode="decimal"
              className="field-input rounded-l-none"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="field-label">Stock quantity</label>
          <input
            type="number"
            min={0}
            className="field-input"
            value={form.stockQty}
            onChange={(e) => set("stockQty", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">SKU</label>
          <input
            className="field-input font-mono"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Condition</label>
          <select
            className="field-input"
            value={form.condition}
            onChange={(e) => set("condition", e.target.value as ProductData["condition"])}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-line text-teal focus:ring-teal"
        />
        Visible to buyers
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : productId ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}
