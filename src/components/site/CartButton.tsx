"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.adet, 0));
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/sepet"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/70 text-cream/80 transition hover:border-gold/50 hover:text-gold"
      aria-label="Sepet"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path d="M6 7h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7z" strokeLinejoin="round" />
        <path d="M9 7a3 3 0 016 0" strokeLinecap="round" />
      </svg>
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-black">
          {count}
        </span>
      )}
    </Link>
  );
}
