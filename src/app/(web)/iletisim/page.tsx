import type { Metadata } from "next";
import { LeadForm } from "@/components/site/LeadForm";

export const metadata: Metadata = { title: "İletişim" };

const BILGILER = [
  { etiket: "Adres", deger: "Beşiktaş, İstanbul" },
  { etiket: "Telefon", deger: "+90 212 000 00 00" },
  { etiket: "E-posta", deger: "merhaba@vipdrive.com" },
  { etiket: "Çalışma saatleri", deger: "7/24 kesintisiz" },
];

export default function IletisimPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-20 md:py-28">
      <div className="max-w-2xl animate-rise">
        <p className="text-sm uppercase tracking-[0.28em] text-gold/70">
          İletişim
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">Sizi dinlemekten mutluluk duyarız</h1>
        <p className="mt-5 text-lg leading-relaxed text-cream/65">
          Yolculuğunuzu planlamak, özel bir talebi görüşmek ya da yalnızca
          tanışmak için bize ulaşın. Ekibimiz size en kısa sürede dönüş yapar.
        </p>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-px overflow-hidden rounded-[var(--radius)] border hairline">
          {BILGILER.map((b) => (
            <div key={b.etiket} className="bg-surface/40 p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-gold/70">
                {b.etiket}
              </p>
              <p className="mt-2 text-lg text-cream">{b.deger}</p>
            </div>
          ))}
        </div>

        <LeadForm tip="ILETISIM" />
      </div>
    </section>
  );
}
