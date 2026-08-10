import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe, platformFeeFor } from "@/lib/stripe";

const statusSchema = z.object({
  status: z.enum(["SHIPPED", "DELIVERED"]),
});

const ALLOWED_TRANSITIONS: Record<string, string> = {
  SHIPPED: "PAID",
  DELIVERED: "SHIPPED",
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { store: true },
  });

  if (!order || order.store.ownerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const requiredCurrentStatus = ALLOWED_TRANSITIONS[parsed.data.status];
  if (order.status !== requiredCurrentStatus) {
    return NextResponse.json(
      { error: `Order must be ${requiredCurrentStatus} before it can move to ${parsed.data.status}` },
      { status: 409 }
    );
  }

  if (parsed.data.status === "SHIPPED") {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "SHIPPED" },
    });
    return NextResponse.json({ order: updated });
  }

  // DELIVERED: release payment to the merchant now that delivery is confirmed.
  if (!order.store.stripeAccountId || !order.store.stripeOnboardingComplete) {
    return NextResponse.json(
      { error: "Connect your Stripe payouts before marking orders as delivered" },
      { status: 400 }
    );
  }

  const platformFeeCents = platformFeeFor(order.totalCents);
  const transferCents = order.totalCents - platformFeeCents;

  const transfer = await stripe.transfers.create({
    amount: transferCents,
    currency: order.currency.toLowerCase(),
    destination: order.store.stripeAccountId,
    transfer_group: order.id,
  });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "DELIVERED",
      platformFeeCents,
      stripeTransferId: transfer.id,
    },
  });

  return NextResponse.json({ order: updated });
}
