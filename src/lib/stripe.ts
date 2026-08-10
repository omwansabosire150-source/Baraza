import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "STRIPE_SECRET_KEY is not set — payment and payout features will fail until it's added to .env"
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

// Baraza's cut of each order, held back before the rest transfers to the
// merchant on delivery confirmation. Adjust freely — this is the only
// place the percentage lives.
export const PLATFORM_FEE_PERCENT = 5;

export function platformFeeFor(totalCents: number) {
  return Math.round((totalCents * PLATFORM_FEE_PERCENT) / 100);
}
