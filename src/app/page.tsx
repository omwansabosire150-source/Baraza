import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-semibold tracking-tight">Baraza</span>
        <nav className="flex items-center gap-3">
          <Link href="/marketplace" className="text-sm text-ink/70 hover:text-ink">
            Browse marketplace
          </Link>
          <Link href="/login" className="btn-secondary">
            Log in
          </Link>
          <Link href="/register?role=MERCHANT" className="btn-primary">
            Open your store
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-teal">
            Merchant home
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
            One stall at the Baraza,
            <br /> open to everyone.
          </h1>
          <p className="mt-5 max-w-md text-ink/70">
            Set up your branded storefront, list what you sell, and reach buyers
            across the marketplace — from a single dashboard, in minutes.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/register?role=MERCHANT" className="btn-primary">
              Start selling
            </Link>
            <Link href="/marketplace" className="btn-secondary">
              Start shopping
            </Link>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="h-2 w-full bg-teal" />
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold">Nyota Electronics</span>
              <span className="rounded-full bg-teal-light px-2.5 py-1 font-mono text-[11px] text-teal-dark">
                LIVE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["USB-C Charger 65W", "BT Mechanical Keyboard"].map((name) => (
                <div key={name} className="rounded-md border border-line p-3">
                  <div className="mb-2 h-16 rounded bg-paper" />
                  <p className="text-sm font-medium">{name}</p>
                  <p className="font-mono text-sm text-teal-dark">$32.00</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink/50">
              This is a live preview of a merchant storefront tile — yours will
              carry your own name, colors, and catalog.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
