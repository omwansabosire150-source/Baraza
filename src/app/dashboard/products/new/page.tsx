import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Add a product</h1>
      <p className="mb-8 text-sm text-ink/60">List a new item in your store.</p>
      <ProductForm />
    </div>
  );
}
