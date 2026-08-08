import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";

export default async function SiteHeader() {
  const user = await getCurrentUser();

  let cartCount = 0;
  if (user) {
    const cart = await prisma.cart.findUnique({
      where: { buyerId: user.id },
      include: { items: true },
    });
    cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/marketplace" className="font-display text-lg font-semibold">
          Baraza
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link href="/marketplace" className="text-ink/70 hover:text-ink">
            Marketplace
          </Link>
          <Link href="/cart" className="relative text-ink/70 hover:text-ink">
            Cart
            {cartCount > 0 && (
              <span className="ml-1 rounded-full bg-teal px-1.5 py-0.5 font-mono text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/account/orders" className="text-ink/70 hover:text-ink">
                Orders
              </Link>
              {user.role === "MERCHANT" && (
                <Link href="/dashboard" className="text-ink/70 hover:text-ink">
                  My store
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="text-ink/70 hover:text-ink">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
