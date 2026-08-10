import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/session";
import SiteHeader from "@/components/SiteHeader";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sessionId = searchParams.session_id;
  if (!sessionId) redirect("/marketplace");

  let paid = false;
  let error: string | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    paid = session.payment_status === "paid";

    if (paid) {
      await prisma.order.updateMany({
        where: { stripeCheckoutSessionId: sessionId, buyerId: user.id, status: "PENDING_PAYMENT" },
        data: {
          status: "PAID",
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        },
      });
    }
  } catch {
    error = "Couldn't confirm payment status with Stripe.";
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        {paid ? (
          <>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-teal">Payment received</p>
            <h1 className="mb-3 font-display text-2xl font-semibold">Thanks — your order is confirmed</h1>
            <p className="mb-8 text-ink/70">
              The store will prepare your order for delivery. You can track its status any time.
            </p>
          </>
        ) : (
          <>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">Payment pending</p>
            <h1 className="mb-3 font-display text-2xl font-semibold">We couldn't confirm payment yet</h1>
            <p className="mb-8 text-ink/70">
              {error ??
                "If you completed payment on Stripe, this can take a few seconds to reflect. Check your orders shortly."}
            </p>
          </>
        )}
        <Link href="/account/orders" className="btn-primary">View your orders</Link>
      </main>
    </div>
  );
}
