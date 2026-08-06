import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  priceCents: z.number().int().nonnegative().optional(),
  currency: z.string().optional(),
  sku: z.string().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  condition: z.enum(["new", "used", "refurbished"]).optional(),
  isActive: z.boolean().optional(),
});

async function assertOwnership(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });
  if (!product || product.store.ownerId !== userId) return null;
  return product;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await assertOwnership(user.id, params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await assertOwnership(user.id, params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: { ...data, imageUrl: data.imageUrl === "" ? null : data.imageUrl },
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await assertOwnership(user.id, params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
