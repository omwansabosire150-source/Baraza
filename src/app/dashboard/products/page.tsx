import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchantStore } from "@/lib/session";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default async function ProductsPage() {
  const store = await getCurrentMerchantStore();

  if (!store) {
    return (
      <div>
        <h1 className="mb-2 font-display text-2xl font-semibold">Products</h1>
        <p className="text-ink/70">
          Set up your store first from{" "}
          <Link href="/dashboard/store" className="text-teal-dark underline">
            Store & branding
          </Link>.
        </p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Link href="/dashboard/products/new" className="btn-primary">
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink/60">You haven't listed anything yet.</p>
          <Link href="/dashboard/products/new" className="btn-primary mt-4 inline-flex">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/60">{p.sku || "—"}</td>
                  <td className="px-4 py-3 font-mono">{formatPrice(p.priceCents, p.currency)}</td>
                  <td className="px-4 py-3">{p.stockQty}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${
                        p.isActive ? "bg-teal-light text-teal-dark" : "bg-line text-ink/50"
                      }`}
                    >
                      {p.isActive ? "ACTIVE" : "HIDDEN"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/products/${p.id}/edit`}
                      className="text-teal-dark underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
