import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Not an admin: pretend this route doesn't exist rather than revealing it.
  if (user.role !== "ADMIN") notFound();

  const nav = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/stores", label: "Stores" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="md:grid md:grid-cols-[220px_1fr]">
        <aside className="border-b border-white/10 p-6 md:min-h-screen md:border-b-0 md:border-r">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-light/70">Baraza</p>
          <p className="font-display text-lg font-semibold">Control</p>

          <nav className="mt-8 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-paper/70 hover:bg-white/5 hover:text-paper"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 border-t border-white/10 pt-4">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-paper/50">{user.email}</p>
            <SignOutButton />
          </div>
        </aside>

        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}