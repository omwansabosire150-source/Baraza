import { NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().default("USD"),
  sku: z.string().optional(),
  stockQty: z.number().int().nonnegative().default(0),
  condition: z.enum(["new", "used", "refurbished"]).default("new"),
});

async function getOwnedStoreOrThrow(userId: string) {
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) throw new Error("NO_STORE");
  return store;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
  if (!store) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let store;
  try {
    store = await getOwnedStoreOrThrow(user.id);
  } catch {
    return NextResponse.json(
      { error: "Set up your store before adding products" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const root = slugify(data.name, { lower: true, strict: true });
  let slug = root;
  let n = 1;
  while (await prisma.product.findFirst({ where: { storeId: store.id, slug } })) {
    n += 1;
    slug = `${root}-${n}`;
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      storeId: store.id,
      slug,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
