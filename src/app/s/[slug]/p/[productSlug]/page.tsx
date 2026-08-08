import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import AddToCartButton from "@/components/AddToCartButton";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string; productSlug: string };
}) {
  const store = await prisma.store.findUnique({ where: { slug: params.slug } });
  if (!store || !store.isPublished) notFound();

  const product = await prisma.product.findFirst({
    where: { storeId: store.id, slug: params.productSlug, isActive: true },
  });
  if (!product) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link href={`/s/${store.slug}`} className="text-sm text-teal-dark underline">
          ← {store.name}
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div
            className="aspect-square rounded-lg bg-paper bg-cover bg-center"
            style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : {}}
          />

          <div>
            <h1 className="font-display text-2xl font-semibold">{product.name}</h1>
            <p className="mt-1 font-mono text-xl text-teal-dark">
              {formatPrice(product.priceCents, product.currency)}
            </p>
            <p className="mt-1 text-sm text-ink/50">
              {product.stockQty > 0 ? `${product.stockQty} in stock` : "Out of stock"} · {product.condition}
            </p>

            {product.description && (
              <p className="mt-5 max-w-md whitespace-pre-line text-ink/70">{product.description}</p>
            )}

            <div className="mt-8">
              <AddToCartButton productId={product.id} maxQty={product.stockQty} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
