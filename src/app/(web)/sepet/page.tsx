import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Sepet" };

export default function SepetPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-20">
      <p className="text-sm uppercase tracking-[0.28em] text-gold/70">Sepet</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Talep özeti</h1>
      <div className="mt-12">
        <CartView />
      </div>
    </section>
  );
}
