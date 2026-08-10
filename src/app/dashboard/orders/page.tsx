import Link from "next/link";
import { getCurrentMerchantStore } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import OrderActions from "@/components/OrderActions";

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

export default async function MerchantOrdersPage() {
  const store = await getCurrentMerchantStore();

  if (!store) {
    return (
      <div>
        <h1 className="mb-2 font-display text-2xl font-semibold">Orders</h1>
        <p className="text-ink/70">
          Set up your store first from{" "}
          <Link href="/dashboard/store" className="text-teal-dark underline">
            Store & branding
          </Link>.
        </p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: { items: true, buyer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-ink/50">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.buyer.name}</p>
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

              <div className="mt-3 border-t border-line pt-3 text-sm text-ink/70">
                <p>Deliver to: {order.shippingName}, {order.shippingAddress}
                  {order.shippingCity ? `, ${order.shippingCity}` : ""}, {order.shippingCountry}
                </p>
                {order.shippingPhone && <p>Phone: {order.shippingPhone}</p>}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm font-medium">
                <span>Total</span>
                <span className="font-mono">{formatPrice(order.totalCents, order.currency)}</span>
              </div>

              {order.status === "DELIVERED" && order.platformFeeCents != null && (
                <p className="mt-2 text-xs text-ink/50">
                  Payout sent: {formatPrice(order.totalCents - order.platformFeeCents, order.currency)}
                  {" "}(platform fee {formatPrice(order.platformFeeCents, order.currency)})
                </p>
              )}

              {(order.status === "PAID" || order.status === "SHIPPED") && (
                <div className="mt-4">
                  <OrderActions orderId={order.id} status={order.status} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
