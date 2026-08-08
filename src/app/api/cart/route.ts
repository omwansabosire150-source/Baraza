import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const addSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

async function getOrCreateCart(buyerId: string) {
  return prisma.cart.upsert({
    where: { buyerId },
    update: {},
    create: { buyerId },
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { buyerId: user.id },
    include: {
      items: {
        include: { product: { include: { store: true } } },
      },
    },
  });

  return NextResponse.json({ cart });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "This product isn't available" }, { status: 404 });
  }

  const cart = await getOrCreateCart(user.id);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } },
  });

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + parsed.data.quantity },
      })
    : await prisma.cartItem.create({
        data: { cartId: cart.id, productId: product.id, quantity: parsed.data.quantity },
      });

  return NextResponse.json({ item }, { status: 201 });
}
