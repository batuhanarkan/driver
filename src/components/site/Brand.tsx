import Link from "next/link";
import { cn } from "@/lib/cn";

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 transition group-hover:border-gold">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M5 16l1.5-5A3 3 0 019.3 9h5.4a3 3 0 012.8 2L19 16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16h16v2a1 1 0 01-1 1h-1a1 1 0 01-1-1M6 19H5a1 1 0 01-1-1v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Vip<span className="gold-text">Drive</span>
      </span>
    </Link>
  );
}
