"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StoreData = {
  name: string;
  category: string;
  description: string;
  brandColor: string;
  country: string;
  city: string;
  logoUrl: string;
  bannerUrl: string;
  returnPolicy: string;
  deliveryMethods: string;
  isPublished: boolean;
};

const CATEGORIES = [
  "Retail shop",
  "Supermarket",
  "Electronics",
  "Pharmacy",
  "Hardware",
  "Restaurant",
  "Beauty",
  "Clothing",
  "Furniture",
  "Agricultural supplies",
  "Automotive parts",
  "Wholesale",
  "Specialty / niche",
  "Digital products",
  "Services",
];

export default function StoreForm({ initial }: { initial: Partial<StoreData> | null }) {
  const router = useRouter();
  const [form, setForm] = useState<StoreData>({
    name: initial?.name ?? "",
    category: initial?.category ?? CATEGORIES[0],
    description: initial?.description ?? "",
    brandColor: initial?.brandColor ?? "#1F6F5C",
    country: initial?.country ?? "",
    city: initial?.city ?? "",
    logoUrl: initial?.logoUrl ?? "",
    bannerUrl: initial?.bannerUrl ?? "",
    returnPolicy: initial?.returnPolicy ?? "",
    deliveryMethods: initial?.deliveryMethods ?? "",
    isPublished: initial?.isPublished ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof StoreData>(key: K, value: StoreData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save your store");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Store name</label>
          <input
            required
            className="field-input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Category</label>
          <select
            className="field-input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Description</label>
        <textarea
          className="field-input"
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What makes your store worth visiting?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Country</label>
          <input
            required
            className="field-input"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">City</label>
          <input
            className="field-input"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Logo URL</label>
          <input
            className="field-input"
            value={form.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <label className="field-label">Banner URL</label>
          <input
            className="field-input"
            value={form.bannerUrl}
            onChange={(e) => set("bannerUrl", e.target.value)}
            placeholder="https://…"
          />
        </div>
      </div>

      <div>
        <label className="field-label">Brand color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            className="h-10 w-14 cursor-pointer rounded border border-line"
            value={form.brandColor}
            onChange={(e) => set("brandColor", e.target.value)}
          />
          <span className="font-mono text-sm text-ink/60">{form.brandColor}</span>
        </div>
      </div>

      <div>
        <label className="field-label">Delivery methods</label>
        <textarea
          className="field-input"
          rows={2}
          value={form.deliveryMethods}
          onChange={(e) => set("deliveryMethods", e.target.value)}
          placeholder="Own fleet, local courier, pickup, third-party delivery…"
        />
      </div>

      <div>
        <label className="field-label">Return policy</label>
        <textarea
          className="field-input"
          rows={2}
          value={form.returnPolicy}
          onChange={(e) => set("returnPolicy", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => set("isPublished", e.target.checked)}
          className="h-4 w-4 rounded border-line text-teal focus:ring-teal"
        />
        Publish this store so buyers can find it
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save store"}
      </button>
    </form>
  );
}
