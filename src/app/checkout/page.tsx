import SiteHeader from "@/components/SiteHeader";
import CheckoutForm from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-1 font-display text-2xl font-semibold">Checkout</h1>
        <p className="mb-8 text-sm text-ink/60">Where should this order be delivered?</p>
        <CheckoutForm />
      </main>
    </div>
  );
}
