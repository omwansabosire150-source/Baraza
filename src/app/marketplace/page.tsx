import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const category = searchParams.category;
  const q = searchParams.q?.trim();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      store: { isPublished: true },
      ...(category ? { store: { isPublished: true, category } } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { store: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const categories = await prisma.store.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">Marketplace</h1>
            <p className="text-sm text-ink/60">Products from every published store on Baraza.</p>
          </div>

          <form className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              className="field-input w-56"
            />
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/marketplace"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              !category ? "border-teal bg-teal-light text-teal-dark" : "border-line text-ink/60"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/marketplace?category=${encodeURIComponent(c.category)}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                category === c.category
                  ? "border-teal bg-teal-light text-teal-dark"
                  : "border-line text-ink/60"
              }`}
            >
              {c.category}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-ink/50">No products match yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/s/${p.store.slug}/p/${p.slug}`}
                className="card overflow-hidden transition hover:border-teal"
              >
                <div
                  className="aspect-square bg-paper bg-cover bg-center"
                  style={p.imageUrl ? { backgroundImage: `url(${p.imageUrl})` } : {}}
                />
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-ink/50">{p.store.name}</p>
                  <p className="mt-1 font-mono text-sm text-teal-dark">
                    {formatPrice(p.priceCents, p.currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
