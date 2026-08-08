import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { store: true },
  });

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Users</h1>
      <p className="mb-8 text-sm text-paper/60">
        To make someone an admin, run{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">npm run db:studio</code>{" "}
        and set their role there directly — deliberately not a button in this UI.
      </p>

      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-paper/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/10 last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-paper/70">{u.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.role}</td>
                <td className="px-4 py-3 text-paper/70">{u.store?.name ?? "—"}</td>
                <td className="px-4 py-3 text-paper/60">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}