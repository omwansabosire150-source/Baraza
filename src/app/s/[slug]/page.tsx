import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function StorefrontPage({ params }: { params: { slug: string } }) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    include: { products: { where: { isActive: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!store || !store.isPublished) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
      <div
        className="h-40 w-full"
        style={{
          background: store.bannerUrl
            ? `center/cover url(${store.bannerUrl})`
            : `linear-gradient(135deg, ${store.brandColor}, #14171F)`,
        }}
      />

      <div className="mx-auto max-w-5xl px-6">
        <div className="-mt-10 mb-8 flex items-end gap-4">
          <div
            className="h-20 w-20 rounded-lg border-4 border-paper bg-surface bg-cover bg-center shadow-sm"
            style={store.logoUrl ? { backgroundImage: `url(${store.logoUrl})` } : {}}
          />
          <div className="pb-1">
            <h1 className="font-display text-2xl font-semibold">{store.name}</h1>
            <p className="text-sm text-ink/60">
              {store.category} · {store.city ? `${store.city}, ` : ""}{store.country}
            </p>
          </div>
        </div>

        {store.description && <p className="mb-10 max-w-2xl text-ink/70">{store.description}</p>}

        <h2 className="mb-4 font-display text-lg font-semibold">Products</h2>
        {store.products.length === 0 ? (
          <p className="pb-16 text-ink/50">This store hasn't listed any products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-16 sm:grid-cols-3 md:grid-cols-4">
            {store.products.map((p) => (
              <Link
                key={p.id}
                href={`/s/${store.slug}/p/${p.slug}`}
                className="card overflow-hidden transition hover:border-teal"
              >
                <div
                  className="aspect-square bg-paper bg-cover bg-center"
                  style={p.imageUrl ? { backgroundImage: `url(${p.imageUrl})` } : {}}
                />
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="font-mono text-sm text-teal-dark">
                    {formatPrice(p.priceCents, p.currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
