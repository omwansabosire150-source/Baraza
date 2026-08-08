import { prisma } from "@/lib/prisma";

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AdminOverview() {
  const [merchantCount, buyerCount, storeCount, publishedCount, productCount, orderCount, gmv, recentOrders] =
    await Promise.all([
      prisma.user.count({ where: { role: "MERCHANT" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.store.count(),
      prisma.store.count({ where: { isPublished: true } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalCents: true } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { store: true, buyer: true },
      }),
    ]);

  const stats = [
    { label: "Merchants", value: merchantCount },
    { label: "Buyers", value: buyerCount },
    { label: "Stores (live / total)", value: `${publishedCount} / ${storeCount}` },
    { label: "Products listed", value: productCount },
    { label: "Orders placed", value: orderCount },
    { label: "Order value, all-time", value: money(gmv._sum.totalCents ?? 0) },
  ];

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Platform overview</h1>
      <p className="mb-8 text-sm text-paper/60">
        Everything happening across Baraza, at a glance. Order value assumes a single
        currency for now — multi-currency totals arrive alongside real payments.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-paper/50">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-10 font-display text-lg font-semibold">Recent orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-paper/50">No orders yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-paper/50">
              <tr>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-white/10 last:border-0">
                  <td className="px-4 py-3">{o.store.name}</td>
                  <td className="px-4 py-3 text-paper/70">{o.buyer.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{STATUS_LABEL[o.status] ?? o.status}</td>
                  <td className="px-4 py-3 font-mono">{money(o.totalCents)}</td>
                  <td className="px-4 py-3 text-paper/60">
                    {new Date(o.createdAt).toLocaleDateString()}
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