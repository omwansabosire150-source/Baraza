import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminStoresPage() {
  const stores = await prisma.store.findMany({
    include: { owner: true, _count: { select: { products: true, orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-semibold">Stores</h1>

      {stores.length === 0 ? (
        <p className="text-paper/50">No stores yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-paper/50">
              <tr>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="border-b border-white/10 last:border-0">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-paper/70">{s.owner.email}</td>
                  <td className="px-4 py-3 text-paper/70">{s.category}</td>
                  <td className="px-4 py-3 text-paper/70">
                    {s.city ? `${s.city}, ` : ""}{s.country}
                  </td>
                  <td className="px-4 py-3">{s._count.products}</td>
                  <td className="px-4 py-3">{s._count.orders}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${
                        s.isPublished ? "bg-teal/20 text-teal-light" : "bg-white/10 text-paper/50"
                      }`}
                    >
                      {s.isPublished ? "LIVE" : "DRAFT"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.isPublished && (
                      <Link href={`/s/${s.slug}`} className="text-amber underline">
                        View
                      </Link>
                    )}
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