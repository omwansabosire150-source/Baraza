import { NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const storeSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #1F6F5C"),
  country: z.string().min(2),
  city: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  returnPolicy: z.string().optional(),
  deliveryMethods: z.string().optional(),
  isPublished: z.boolean().optional(),
});

async function uniqueSlug(base: string, ignoreStoreId?: string) {
  const root = slugify(base, { lower: true, strict: true });
  let candidate = root;
  let n = 1;
  while (
    await prisma.store.findFirst({
      where: { slug: candidate, ...(ignoreStoreId ? { id: { not: ignoreStoreId } } : {}) },
    })
  ) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
  return NextResponse.json({ store });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = storeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const existing = await prisma.store.findUnique({ where: { ownerId: user.id } });
  const data = parsed.data;

  if (existing) {
    const needsNewSlug = existing.name !== data.name;
    const slug = needsNewSlug ? await uniqueSlug(data.name, existing.id) : existing.slug;

    const updated = await prisma.store.update({
      where: { id: existing.id },
      data: {
        ...data,
        logoUrl: data.logoUrl || null,
        bannerUrl: data.bannerUrl || null,
        slug,
      },
    });
    return NextResponse.json({ store: updated });
  }

  const slug = await uniqueSlug(data.name);
  const created = await prisma.store.create({
    data: {
      ownerId: user.id,
      slug,
      ...data,
      logoUrl: data.logoUrl || null,
      bannerUrl: data.bannerUrl || null,
    },
  });

  return NextResponse.json({ store: created }, { status: 201 });
}
