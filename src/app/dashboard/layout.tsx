import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentMerchantStore } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const store = await getCurrentMerchantStore();

  const nav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/store", label: "Store & branding" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/orders", label: "Orders" },
  ];

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-surface p-6 md:min-h-screen md:border-b-0 md:border-r">
        <Link href="/" className="font-display text-lg font-semibold">
          Baraza
        </Link>
        <p className="mt-1 truncate text-xs text-ink/50">{store?.name ?? "No store yet"}</p>

        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-ink/70 hover:bg-paper hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 border-t border-line pt-4">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-ink/50">{user.email}</p>
          <SignOutButton />
        </div>
      </aside>

      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
