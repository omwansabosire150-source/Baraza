import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const updateSchema = z.object({
  quantity: z.number().int().positive(),
});

async function assertOwnership(userId: string, itemId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.buyerId !== userId) return null;
  return item;
}

export async function PATCH(req: Request, { params }: { params: { itemId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await assertOwnership(user.id, params.itemId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: parsed.data.quantity },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: Request, { params }: { params: { itemId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await assertOwnership(user.id, params.itemId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.cartItem.delete({ where: { id: item.id } });
  return NextResponse.json({ ok: true });
}
