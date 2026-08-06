import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchantStore } from "@/lib/session";
import ProductForm from "@/components/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const store = await getCurrentMerchantStore();
  if (!store) notFound();

  const product = await prisma.product.findFirst({
    where: { id: params.id, storeId: store.id },
  });
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Edit product</h1>
      <p className="mb-8 text-sm text-ink/60">{product.name}</p>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
          priceCents: product.priceCents,
          currency: product.currency,
          sku: product.sku ?? "",
          stockQty: product.stockQty,
          condition: product.condition as "new" | "used" | "refurbished",
          isActive: product.isActive,
        }}
      />
    </div>
  );
}