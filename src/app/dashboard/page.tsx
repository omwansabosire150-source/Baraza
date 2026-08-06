import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchantStore } from "@/lib/session";

export default async function DashboardOverview() {
  const store = await getCurrentMerchantStore();

  if (!store) {
    return (
      <div className="max-w-xl">
        <h1 className="mb-2 font-display text-2xl font-semibold">Set up your store</h1>
        <p className="mb-6 text-ink/70">
          You need a storefront before you can list products or go live on Baraza.
        </p>
        <Link href="/dashboard/store" className="btn-primary">
          Set up store
        </Link>
      </div>
    );
  }

  const [productCount, activeCount] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.product.count({ where: { storeId: store.id, isActive: true } }),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{store.name}</h1>
          <p className="text-sm text-ink/60">
            {store.category} · {store.city ? `${store.city}, ` : ""}{store.country}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 font-mono text-xs ${
            store.isPublished ? "bg-teal-light text-teal-dark" : "bg-amber-light text-amber"
          }`}
        >
          {store.isPublished ? "PUBLISHED" : "DRAFT"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-ink/50">Products listed</p>
          <p className="mt-1 font-display text-3xl font-semibold">{productCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-ink/50">Active products</p>
          <p className="mt-1 font-display text-3xl font-semibold">{activeCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-ink/50">Payouts</p>
          <p className="mt-1 text-sm text-ink/60">
            {store.stripeAccountId ? "Connected" : "Not connected yet"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/dashboard/products/new" className="btn-primary">
          Add a product
        </Link>
        <Link href={`/s/${store.slug}`} className="btn-secondary">
          View storefront
        </Link>
      </div>
    </div>
  );
}
