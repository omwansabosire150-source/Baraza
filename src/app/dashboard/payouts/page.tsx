import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentMerchantStore } from "@/lib/session";
import ConnectStripeButton from "@/components/ConnectStripeButton";

export default async function PayoutsPage() {
  const store = await getCurrentMerchantStore();

  if (!store) {
    return (
      <div>
        <h1 className="mb-2 font-display text-2xl font-semibold">Payouts</h1>
        <p className="text-ink/70">
          Set up your store first from{" "}
          <Link href="/dashboard/store" className="text-teal-dark underline">
            Store & branding
          </Link>.
        </p>
      </div>
    );
  }

  // If a Stripe account exists, re-check its live status — the merchant may
  // have just finished (or abandoned) onboarding on Stripe's site.
  let onboardingComplete = store.stripeOnboardingComplete;
  if (store.stripeAccountId) {
    try {
      const account = await stripe.accounts.retrieve(store.stripeAccountId);
      onboardingComplete = Boolean(account.details_submitted && account.charges_enabled);
      if (onboardingComplete !== store.stripeOnboardingComplete) {
        await prisma.store.update({
          where: { id: store.id },
          data: { stripeOnboardingComplete: onboardingComplete },
        });
      }
    } catch {
      // Stripe not reachable or key misconfigured — fall back to stored value.
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 font-display text-2xl font-semibold">Payouts</h1>
      <p className="mb-8 text-sm text-ink/60">
        Connect a Stripe account so you can receive payment once orders are delivered.
      </p>

      <div className="card p-6">
        {onboardingComplete ? (
          <>
            <span className="mb-3 inline-block rounded-full bg-teal-light px-3 py-1 font-mono text-xs text-teal-dark">
              CONNECTED
            </span>
            <p className="text-sm text-ink/70">
              Your Stripe account is ready to receive payouts. When you mark an
              order as delivered, your share (minus the platform fee) transfers
              automatically.
            </p>
          </>
        ) : store.stripeAccountId ? (
          <>
            <span className="mb-3 inline-block rounded-full bg-amber-light px-3 py-1 font-mono text-xs text-amber">
              SETUP INCOMPLETE
            </span>
            <p className="mb-4 text-sm text-ink/70">
              You started connecting Stripe but didn't finish. Pick up where you left off.
            </p>
            <ConnectStripeButton label="Continue Stripe setup" />
          </>
        ) : (
          <>
            <span className="mb-3 inline-block rounded-full bg-line px-3 py-1 font-mono text-xs text-ink/60">
              NOT CONNECTED
            </span>
            <p className="mb-4 text-sm text-ink/70">
              You can't receive payouts until this is set up. It takes a few
              minutes on Stripe's site.
            </p>
            <ConnectStripeButton label="Connect with Stripe" />
          </>
        )}
      </div>
    </div>
  );
}
