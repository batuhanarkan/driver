import type { Metadata } from "next";
import { ReservationForm } from "./ReservationForm";
import { getServices, getVehicles } from "@/lib/services";

export const metadata: Metadata = { title: "Rezervasyon" };

export default async function RezervasyonPage({
  searchParams,
}: {
  searchParams: Promise<{ hizmet?: string }>;
}) {
  const [{ hizmet }, services, vehicles] = await Promise.all([
    searchParams,
    getServices(),
    getVehicles(),
  ]);

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
          vehicles={vehicles.map((v) => ({
            id: v.id,
            ad: v.ad,
            sinif: v.sinif,
            kapasite: v.kapasite,
            fiyat: v.fiyat,
          }))}
          defaultSlug={hizmet}
        />
      </div>
    </section>
  );
}
