import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getActiveCampaigns } from "@/lib/services";

export const metadata: Metadata = { title: "Fırsatlar" };

function gecerlilik(b: Date | null, e: Date | null): string | null {
  const fmt = (d: Date) =>
    d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  if (b && e) return `${fmt(b)} – ${fmt(e)} arası geçerli`;
  if (e) return `${fmt(e)} tarihine kadar`;
  if (b) return `${fmt(b)} itibarıyla`;
  return null;
}

export default async function FirsatlarPage() {
  const campaigns = await getActiveCampaigns();

  return (
    <>
      {/* ÜST BAŞLIK */}
      <section className="container-px mx-auto max-w-7xl py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="animate-rise text-sm uppercase tracking-[0.28em] text-gold/70">
            Ayrıcalıklar
          </p>
          <h1
            className="animate-rise mt-3 text-5xl leading-[1.05] md:text-6xl"
            style={{ animationDelay: "0.08s" }}
          >
            Size özel <span className="gold-text italic">fırsatlar.</span>
          </h1>
          <p
            className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-cream/65"
            style={{ animationDelay: "0.16s" }}
          >
            Sezonluk kampanyalar, ayrıcalıklı paketler ve düzenli misafirlerimize
            özel avantajlar. Güncel fırsatları keşfedin, ayrıcalıklı yolculuğunuzu
            planlayın.
          </p>
        </div>

        {/* KAMPANYALAR */}
        {campaigns.length > 0 ? (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c, idx) => (
              <article
                key={c.id}
                className="animate-rise group flex flex-col justify-between overflow-hidden rounded-[var(--radius)] border hairline bg-surface/40 p-7 transition duration-500 hover:border-gold/40 hover:bg-surface/70"
                style={{ animationDelay: `${0.08 * idx}s` }}
              >
                <div>
                  {c.indirimYuzde > 0 && (
                    <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                      %{c.indirimYuzde} indirim
                    </span>
                  )}
                  <h2 className="mt-4 text-2xl">{c.baslik}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-cream/55">
                    {c.aciklama}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {c.service && (
                      <Link
                        href={`/hizmetler/${c.service.slug}`}
                        className="rounded-full border border-gold/30 px-3 py-1 text-gold/90 transition hover:bg-gold/10"
                      >
                        {c.service.baslik}
                      </Link>
                    )}
                    {gecerlilik(c.baslangic, c.bitis) && (
                      <span className="rounded-full bg-cream/5 px-3 py-1 text-cream/55">
                        {gecerlilik(c.baslangic, c.bitis)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  <Button
                    href={
                      c.service
                        ? `/rezervasyon?hizmet=${c.service.slug}`
                        : "/rezervasyon"
                    }
                    variant="outline"
                  >
                    Rezervasyon Yap
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-14 flex flex-col items-center justify-center rounded-[var(--radius)] border hairline bg-surface/30 px-8 py-20 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 text-2xl text-gold">
              ✦
            </span>
            <h2 className="mt-6 text-2xl text-cream/80">
              Şu anda aktif kampanya yok, yakında!
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/55">
              Yeni fırsatlarımız için hazırlıklarımız sürüyor. Dilerseniz hemen bir
              rezervasyon oluşturarak ayrıcalıklı hizmetimizi deneyimleyebilirsiniz.
            </p>
            <Button href="/rezervasyon" variant="outline" className="mt-8">
              Rezervasyon Oluştur
            </Button>
          </div>
        )}
      </section>

      {/* CTA BANDI */}
      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="overflow-hidden rounded-[var(--radius)] border border-gold/20 bg-gradient-to-br from-surface/80 to-ink p-10 text-center md:p-16">
          <h2 className="mx-auto max-w-2xl text-4xl md:text-5xl">
            Fırsatları <span className="gold-text">yolculuğa</span> dönüştürün.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-cream/60">
            Size en uygun hizmeti seçin, talebinizi saniyeler içinde oluşturun;
            gerisini VipDrive ekibi halletsin.
          </p>
          <Button href="/rezervasyon" size="lg" className="mt-8">
            Rezervasyon Oluştur
          </Button>
        </div>
      </section>
    </>
  );
}
