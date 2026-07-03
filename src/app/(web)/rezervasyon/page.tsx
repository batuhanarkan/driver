import type { Metadata } from "next";
import { ReservationForm } from "./ReservationForm";
import { getServices } from "@/lib/services";
import { getProvinces } from "@/lib/geo";

export const metadata: Metadata = { title: "Rezervasyon" };

export default async function RezervasyonPage({
  searchParams,
}: {
  searchParams: Promise<{
    hizmet?: string;
    il?: string;
    tarih?: string;
    durak?: string;
  }>;
}) {
  const [sp, services, provinces] = await Promise.all([
    searchParams,
    getServices(),
    getProvinces(),
  ]);
  const hizmet = sp.hizmet;
  const durak = sp.durak ? parseInt(sp.durak, 10) : 0;

  return (
    <section className="container-px mx-auto max-w-7xl py-20">
      <p className="text-sm uppercase tracking-[0.28em] text-gold/70">Rezervasyon</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Talebinizi oluşturun</h1>
      <p className="mt-4 max-w-xl text-cream/60">
        Hizmeti seçin, detayları girin ve sepete ekleyin. Birden fazla hizmeti
        tek siparişte birleştirebilirsiniz.
      </p>

      <div className="mt-12">
        <ReservationForm
          services={services.map((s) => ({
            id: s.id,
            slug: s.slug,
            baslik: s.baslik,
            kategori: s.kategori,
            temelFiyat: s.temelFiyat,
          }))}
          provinces={provinces}
          defaultSlug={hizmet}
          defaults={{ ilSlug: sp.il, tarih: sp.tarih, durak }}
        />
      </div>
    </section>
  );
}
