"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/siparisler", label: "Siparişler" },
  { href: "/admin/hizmetler", label: "Hizmetler" },
  { href: "/admin/araclar", label: "Araçlar" },
  { href: "/admin/kampanyalar", label: "Kampanyalar" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar" },
  { href: "/admin/talepler", label: "Talepler" },
  { href: "/admin/raporlar", label: "Raporlar" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="border-b hairline bg-ink-2/60 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col gap-6 p-5 md:min-h-screen">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-gold text-sm">
            V
          </span>
          <span className="font-display text-lg">
            Vip<span className="gold-text">Drive</span>
            <span className="ml-1 text-xs text-cream/40">yönetim</span>
          </span>
        </Link>

        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV.map((n) => {
            const active =
              n.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2.5 text-sm transition",
                  active
                    ? "bg-gold/12 text-gold"
                    : "text-cream/65 hover:bg-cream/5 hover:text-cream",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden gap-2 border-t hairline pt-5 md:flex md:flex-col">
          <p className="px-2 text-xs text-cream/40">{userName}</p>
          <Link
            href="/"
            className="rounded-xl px-4 py-2 text-sm text-cream/65 transition hover:bg-cream/5 hover:text-cream"
          >
            ← Siteye dön
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-xl px-4 py-2 text-left text-sm text-cream/65 transition hover:bg-cream/5 hover:text-rose-700"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </aside>
  );
}
