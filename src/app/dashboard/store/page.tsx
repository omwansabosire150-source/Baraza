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
      <StoreForm
        initial={
          store
            ? {
                name: store.name,
                category: store.category,
                description: store.description ?? "",
                brandColor: store.brandColor,
                country: store.country,
                city: store.city ?? "",
                logoUrl: store.logoUrl ?? "",
                bannerUrl: store.bannerUrl ?? "",
                returnPolicy: store.returnPolicy ?? "",
                deliveryMethods: store.deliveryMethods ?? "",
                isPublished: store.isPublished,
              }
            : null
        }
      />
    </div>
  );
}
