"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-2 text-xs font-medium text-teal-dark underline"
    >
      Sign out
    </button>
  );
}
