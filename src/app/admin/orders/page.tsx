import { prisma } from "@/lib/prisma";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { store: true, buyer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-paper/50">No orders yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-paper/50">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-white/10 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-paper/60">#{o.id.slice(-8)}</td>
                  <td className="px-4 py-3">{o.store.name}</td>
                  <td className="px-4 py-3 text-paper/70">{o.buyer.email}</td>
                  <td className="px-4 py-3">{o.items.length}</td>
                  <td className="px-4 py-3 font-mono text-xs">{STATUS_LABEL[o.status] ?? o.status}</td>
                  <td className="px-4 py-3 font-mono">{money(o.totalCents, o.currency)}</td>
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