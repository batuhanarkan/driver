"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded border border-line bg-white px-4 py-2 text-sm text-cream"
    >
      Çıkış Yap
    </button>
  );
}
