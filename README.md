# Baraza — Merchant MVP

Phase 1 of the Baraza marketplace: merchant registration, storefront branding,
product catalog management, and a public storefront preview page. This is the
foundation that POS, escrow payments, logistics, and recommendations get built
on top of in later phases.

**Stack:** Next.js 14 (App Router, TypeScript) · Prisma · PostgreSQL · NextAuth
· Tailwind CSS

---

## 1. Prerequisites

- Node.js 18.18+ (check with `node -v`)
- A PostgreSQL database — pick one:
  - **Local**: install Postgres and create a database called `baraza`
  - **Free hosted (recommended to get moving fast)**: [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) — both give you a `DATABASE_URL` in under 2 minutes, no local install needed

## 2. Setup

```bash
cd baraza
npm install
cp .env.example .env
```

Open `.env` and fill in:

- `DATABASE_URL` — your Postgres connection string
- `NEXTAUTH_SECRET` — generate one with `openssl rand -base64 32`
- `NEXTAUTH_URL` — leave as `http://localhost:3000` for local dev

Push the schema to your database:

```bash
npm run db:push
```

(Optional) Seed a demo merchant and a couple of products:

```bash
npm run db:seed
```
This creates a login: `demo@baraza.market` / `password123`.

## 3. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`. Register a merchant account, set up your store
under **Store & branding**, publish it, then add products. Your live
storefront is at `http://localhost:3000/s/your-store-slug`.

Browse your data directly any time with:

```bash
npm run db:studio
```

## 4. Deploy it (so it's live on the internet)

The fastest path with this stack:

1. Push this folder to a new GitHub repository.
2. Create a free Postgres database at [neon.tech](https://neon.tech) if you haven't already — copy its connection string.
3. Go to [vercel.com](https://vercel.com), import the GitHub repo.
4. In Vercel's project settings, add the same environment variables as your
   `.env` (`DATABASE_URL`, `NEXTAUTH_SECRET`, and set `NEXTAUTH_URL` to your
   Vercel URL, e.g. `https://your-app.vercel.app`).
5. Deploy. Vercel runs `npm install` (which triggers `prisma generate`) and
   `npm run build` automatically.
6. Run `npx prisma db push` once against the production `DATABASE_URL` (from
   your laptop, with `.env` pointed at production, or via Vercel's console) so
   the schema exists in your live database.

That's it — you'll have a real URL you can share.

## 5. What's next (not built yet, by design)

This MVP intentionally stops at the merchant/storefront layer so it ships as
something real and testable, rather than a half-finished version of everything
at once. The natural next slices, in order:

1. **Buyer-side marketplace** — account creation, browsing across stores, cart,
   checkout.
2. **Payments** — Stripe Connect (or a regional equivalent) so buyer payments
   are held and only released to the merchant on delivery confirmation. The
   `stripeAccountId` field on `Store` is already there for this.
3. **POS sync** — barcode-driven in-store sales that adjust the same
   `Product.stockQty` used online.
4. **Logistics integrations** — per-region courier/rideshare API plug-ins.
5. **Discovery/recommendations** — start with rule-based trending/velocity
   scoring on top of order data, graduate to ML once there's real usage data
   to learn from.
6. **Cross-border & compliance** — currency conversion, customs, tax; likely
   needs a specialist payment/logistics partner rather than fully custom code.

## Project structure

```
src/
  app/
    page.tsx                 → landing page
    login/, register/        → auth pages
    dashboard/                → merchant dashboard (protected)
      store/                  → branding form
      products/                → product list, add, edit
    s/[slug]/                → public storefront page
    api/                     → auth, register, store, products endpoints
  components/                → StoreForm, ProductForm, SignOutButton
  lib/                       → prisma client, auth config, session helpers
prisma/
  schema.prisma              → data model
  seed.ts                    → demo data
```
