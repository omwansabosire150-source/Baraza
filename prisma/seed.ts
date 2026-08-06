import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.upsert({
    where: { email: "demo@baraza.market" },
    update: {},
    create: {
      name: "Demo Merchant",
      email: "demo@baraza.market",
      passwordHash,
      role: "MERCHANT",
    },
  });

  const store = await prisma.store.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Nyota Electronics",
      slug: "nyota-electronics",
      category: "Electronics",
      description: "Hard-to-find electronics and accessories, sourced regionally.",
      brandColor: "#1F6F5C",
      country: "Kenya",
      city: "Nairobi",
      isPublished: true,
    },
  });

  await prisma.product.createMany({
    data: [
      {
        storeId: store.id,
        name: "USB-C Fast Charger 65W",
        slug: "usb-c-fast-charger-65w",
        priceCents: 3200,
        currency: "USD",
        sku: "NYE-001",
        stockQty: 42,
      },
      {
        storeId: store.id,
        name: "Bluetooth Mechanical Keyboard",
        slug: "bluetooth-mechanical-keyboard",
        priceCents: 8900,
        currency: "USD",
        sku: "NYE-002",
        stockQty: 15,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete. Login with demo@baraza.market / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
