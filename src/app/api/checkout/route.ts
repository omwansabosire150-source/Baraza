import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  shippingName: z.string().min(2),
  shippingPhone: z.string().optional(),
  shippingAddress: z.string().min(4),
  shippingCity: z.string().optional(),
  shippingCountry: z.string().min(2),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid shipping details" },
      { status: 400 }
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { buyerId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  // Guard against stale carts: re-check stock right before committing.
  for (const item of cart.items) {
    if (!item.product.isActive || item.product.stockQty < item.quantity) {
      return NextResponse.json(
        { error: `"${item.product.name}" no longer has enough stock` },
        { status: 409 }
      );
    }
  }

  // Group items by store — each store settles as its own order.
  const byStore = new Map<string, typeof cart.items>();
  for (const item of cart.items) {
    const list = byStore.get(item.product.storeId) ?? [];
    list.push(item);
    byStore.set(item.product.storeId, list);
  }

  const shipping = parsed.data;

  const orderIds = await prisma.$transaction(async (tx) => {
    const ids: string[] = [];

    for (const [storeId, items] of byStore) {
      const totalCents = items.reduce(
        (sum, i) => sum + i.product.priceCents * i.quantity,
        0
      );

      const order = await tx.order.create({
        data: {
          buyerId: user.id,
          storeId,
          totalCents,
          currency: items[0].product.currency,
          shippingName: shipping.shippingName,
          shippingPhone: shipping.shippingPhone,
          shippingAddress: shipping.shippingAddress,
          shippingCity: shipping.shippingCity,
          shippingCountry: shipping.shippingCountry,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              nameSnapshot: i.product.name,
              priceCentsSnapshot: i.product.priceCents,
              quantity: i.quantity,
            })),
          },
        },
      });

      for (const i of items) {
        await tx.product.update({
          where: { id: i.productId },
          data: { stockQty: { decrement: i.quantity } },
        });
      }

      ids.push(order.id);
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return ids;
  });

  // Stripe Checkout requires one currency per session. This MVP assumes a
  // single currency across the cart (true for now — every store defaults to
  // USD) rather than splitting into separate payments per currency.
  const currency = cart.items[0].product.currency.toLowerCase();
  const origin = new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: cart.items.map((i) => ({
      price_data: {
        currency,
        product_data: { name: i.product.name },
        unit_amount: i.product.priceCents,
      },
      quantity: i.quantity,
    })),
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    customer_email: user.email,
    metadata: { orderIds: orderIds.join(",") },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Couldn't start payment" }, { status: 500 });
  }

  await prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { stripeCheckoutSessionId: session.id },
  });

  return NextResponse.json({ url: session.url }, { status: 201 });
}
