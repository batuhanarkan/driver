import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Talebiniz Alındı" };

export default async function SiparisAlindiPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const { no } = await searchParams;

  return (
    <section className="container-px mx-auto max-w-2xl py-28 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 text-gold">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <h1 className="mt-8 text-4xl md:text-5xl">
        Talebiniz <span className="gold-text">alındı</span>
      </h1>

      {no && (
        <p className="mt-4 text-cream/60">
          Talep numaranız:{" "}
          <span className="font-display text-xl text-cream">{no}</span>
        </p>
      )}

      <p className="mx-auto mt-4 max-w-md text-cream/60">
        Ekibimiz en kısa sürede sizinle iletişime geçecek. Ödeme alınmaz; tüm
        detaylar telefonla teyit edilir.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button href="/">Ana Sayfa</Button>
        <Button href="/rezervasyon" variant="outline">
          Yeni Talep
        </Button>
      </div>
    </section>
  );
}
