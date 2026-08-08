import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { placed?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: { items: true, store: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-1 font-display text-2xl font-semibold">Your orders</h1>

        {searchParams.placed && (
          <p className="mb-6 rounded-md bg-teal-light px-3 py-2 text-sm text-teal-dark">
            Order placed! The store will confirm and ship it soon.
          </p>
        )}

        {orders.length === 0 ? (
          <p className="mt-6 text-ink/50">You haven't placed any orders yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.store.name}</p>
                    <p className="text-xs text-ink/50">
                      {new Date(order.createdAt).toLocaleDateString()} · #{order.id.slice(-8)}
                    </p>
                  </div>
                  <span className="rounded-full bg-paper px-2.5 py-1 font-mono text-[11px] text-ink/70">
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>

                <ul className="space-y-1 text-sm text-ink/70">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.quantity} × {item.nameSnapshot}</span>
                      <span className="font-mono">
                        {formatPrice(item.priceCentsSnapshot * item.quantity, order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm font-medium">
                  <span>Total</span>
                  <span className="font-mono">{formatPrice(order.totalCents, order.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
