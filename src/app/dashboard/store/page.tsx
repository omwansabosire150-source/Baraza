import { getCurrentMerchantStore } from "@/lib/session";
import StoreForm from "@/components/StoreForm";

export default async function StoreSettingsPage() {
  const store = await getCurrentMerchantStore();

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Store & branding</h1>
      <p className="mb-8 text-sm text-ink/60">
        This is what buyers see when they visit your storefront.
      </p>
      <StoreForm initial={store} />
    </div>
  );
}
