import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none";

const variantCls: Record<Variant, string> = {
  primary:
    "bg-gold text-black hover:bg-gold-2 shadow-[0_14px_44px_-14px_rgba(201,162,74,0.65)]",
  outline: "border border-gold/40 text-gold hover:border-gold hover:bg-gold/10",
  ghost: "text-cream/80 hover:text-cream hover:bg-cream/5",
};

const sizeCls: Record<Size, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-[0.95rem]",
};

type Props = {
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Props) {
  const cls = cn(base, variantCls[variant], sizeCls[size], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
