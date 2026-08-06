import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as { id: string; name: string; email: string; role: string };
}

export async function getCurrentMerchantStore() {
  const user = await getCurrentUser();
  if (!user) return null;
  return prisma.store.findUnique({ where: { ownerId: user.id } });
}
