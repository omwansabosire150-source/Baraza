"use client";

import { useState } from "react";

export default function CheckoutForm() {
  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingCountry: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPlacing(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't place your order");
      setPlacing(false);
      return;
    }

    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="field-label">Full name</label>
        <input
          required
          className="field-input"
          value={form.shippingName}
          onChange={(e) => set("shippingName", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Phone</label>
        <input
          className="field-input"
          value={form.shippingPhone}
          onChange={(e) => set("shippingPhone", e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">Delivery address</label>
        <textarea
          required
          rows={2}
          className="field-input"
          value={form.shippingAddress}
          onChange={(e) => set("shippingAddress", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">City</label>
          <input
            className="field-input"
            value={form.shippingCity}
            onChange={(e) => set("shippingCity", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Country</label>
          <input
            required
            className="field-input"
            value={form.shippingCountry}
            onChange={(e) => set("shippingCountry", e.target.value)}
          />
        </div>
      </div>

      <p className="rounded-md border border-amber/40 bg-amber-light px-3 py-2 text-xs text-ink/70">
        You'll be taken to Stripe's secure checkout next. Baraza holds the
        payment and releases it to the merchant once your order is delivered.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={placing} className="btn-primary w-full">
        {placing ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}