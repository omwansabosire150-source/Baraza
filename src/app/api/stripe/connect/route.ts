import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
  if (!store) {
    return NextResponse.json({ error: "Set up your store first" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;

  let accountId = store.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      business_type: "individual",
    });
    accountId = account.id;
    await prisma.store.update({
      where: { id: store.id },
      data: { stripeAccountId: accountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/dashboard/payouts`,
    return_url: `${origin}/dashboard/payouts`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
