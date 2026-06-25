"use client";

import Link from "next/link";
import { useState } from "react";

type NavItem = { href: string; label: string };

export function MobileMenu({
  nav,
  isLoggedIn,
  isAdmin,
}: {
  nav: NavItem[];
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/70 text-cream/80"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-ink/97 p-6 backdrop-blur-xl">
          <div className="flex justify-end">
            <button
              onClick={close}
              aria-label="Kapat"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/70 text-cream/80"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-5">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={close}
                className="font-display text-3xl text-cream/90 transition hover:text-gold"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-6 h-px bg-line/60" />
            {isAdmin && (
              <Link href="/admin" onClick={close} className="text-xl text-gold">
                Yönetim Paneli
              </Link>
            )}
            {isLoggedIn ? (
              <Link href="/hesabim" onClick={close} className="text-xl text-cream/80">
                Hesabım
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/giris" onClick={close} className="text-xl text-cream/80">
                  Giriş Yap
                </Link>
                <Link href="/kayit" onClick={close} className="text-xl text-gold">
                  Üye Ol
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
