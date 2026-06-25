import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { getServices, getActiveCampaigns, CATEGORY_META } from "@/lib/services";
import { formatTRY } from "@/lib/format";

export default async function HomePage() {
  const [services, campaigns] = await Promise.all([
    getServices(),
    getActiveCampaigns(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-px mx-auto max-w-7xl py-24 md:py-36">
          <div className="max-w-3xl">
            <p className="animate-rise text-sm uppercase tracking-[0.32em] text-gold/80">
              İstanbul · Premium Ulaşım
            </p>
            <h1
              className="animate-rise mt-6 text-5xl leading-[1.05] md:text-7xl"
              style={{ animationDelay: "0.08s" }}
            >
              Ayrıcalıklı ulaşımın
              <br />
              <span className="gold-text italic">yeni adı.</span>
            </h1>
            <p
              className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-cream/65"
              style={{ animationDelay: "0.16s" }}
            >
              Şoförlü araç, havalimanı transferi, özel turlar ve VIP karşılama.
              Tek talep, kusursuz organizasyon — VipDrive ekibi gerisini halleder.
            </p>
            <div
              className="animate-rise mt-10 flex flex-wrap gap-4"
              style={{ animationDelay: "0.24s" }}
            >
              <Button href="#hizmetler" size="lg">
                Hizmetleri Keşfet
              </Button>
              <Button href="/rezervasyon" size="lg" variant="outline">
                Hemen Rezervasyon
              </Button>
            </div>

            <div
              className="animate-rise mt-16 flex flex-wrap items-center gap-x-12 gap-y-6"
              style={{ animationDelay: "0.32s" }}
            >
              {[
                ["7/24", "Kesintisiz hizmet"],
                ["5★", "Misafir memnuniyeti"],
                ["1989", "Kökleşmiş tecrübe"],
              ].map(([k, v]) => (
                <div key={v}>
                  <div className="font-display text-3xl text-gold">{k}</div>
                  <div className="mt-1 text-sm text-cream/50">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* dekoratif altın halkalar */}
        <div className="pointer-events-none absolute -right-40 top-1/2 hidden -translate-y-1/2 lg:block">
          <div className="h-[34rem] w-[34rem] rounded-full border border-gold/10" />
          <div className="absolute inset-10 rounded-full border border-gold/10" />
          <div className="absolute inset-24 rounded-full border border-gold/15" />
        </div>
      </section>

      {/* HİZMETLER */}
      <section id="hizmetler" className="container-px mx-auto max-w-7xl py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold/70">
              Hizmetlerimiz
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl">Her yolculuğa bir çözüm</h2>
          </div>
          <Link
            href="/rezervasyon"
            className="hidden shrink-0 text-sm text-cream/60 underline-offset-4 transition hover:text-gold hover:underline md:block"
          >
            Tüm hizmetler →
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, idx) => {
            const meta = CATEGORY_META[s.kategori];
            const featured = idx === 0;
            return (
              <Link
                key={s.id}
                href={`/hizmetler/${s.slug}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius)] border hairline bg-surface/40 p-7 transition duration-500 hover:border-gold/40 hover:bg-surface/70 ${
                  featured ? "sm:col-span-2 lg:col-span-1 lg:row-span-1" : ""
                }`}
              >
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 text-gold transition group-hover:bg-gold group-hover:text-black">
                    <ServiceIcon name={meta.icon} />
                  </span>
                  <h3 className="mt-6 text-2xl">{s.baslik}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/55">
                    {meta.tagline}
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm text-cream/50">
                    <span className="text-gold">{formatTRY(s.temelFiyat)}</span>
                    'den başlayan
                  </span>
                  <span className="text-gold transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* NEDEN VIPDRIVE */}
      <section className="border-y hairline bg-ink-2/40">
        <div className="container-px mx-auto grid max-w-7xl gap-12 py-20 md:grid-cols-2">
          <div>
            <h2 className="text-4xl md:text-5xl">Neden VipDrive?</h2>
            <p className="mt-5 max-w-md text-cream/60">
              Lüks bir araçtan fazlasını sunuyoruz: dakikliği, gizliliği ve
              detaylara gösterilen özeni bir arada.
            </p>
            <Button href="/kurumsal" variant="outline" className="mt-8">
              Kurumsal Çözümler
            </Button>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border hairline sm:grid-cols-2">
            {[
              ["Profesyonel şoförler", "Çok dilli, deneyimli ve takım elbiseli kadro."],
              ["Üst segment filo", "Bakımlı, konforlu ve temsil gücü yüksek araçlar."],
              ["Dakiklik garantisi", "Uçuş takibi ve gerçek zamanlı planlama."],
              ["Gizlilik & güven", "Misafir mahremiyetine tam saygı."],
            ].map(([t, d]) => (
              <div key={t} className="bg-surface/40 p-7">
                <h4 className="text-lg text-cream">{t}</h4>
                <p className="mt-2 text-sm leading-relaxed text-cream/55">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIRSATLAR / CTA */}
      <section className="container-px mx-auto max-w-7xl py-24">
        {campaigns.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {campaigns.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="glass rounded-[var(--radius)] p-7"
              >
                {c.indirimYuzde > 0 && (
                  <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                    %{c.indirimYuzde} indirim
                  </span>
                )}
                <h3 className="mt-4 text-2xl">{c.baslik}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/55">
                  {c.aciklama}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-16 overflow-hidden rounded-[var(--radius)] border border-gold/20 bg-gradient-to-br from-surface/80 to-ink p-10 text-center md:p-16">
          <h2 className="mx-auto max-w-2xl text-4xl md:text-5xl">
            Bir sonraki yolculuğunuz <span className="gold-text">ayrıcalıklı</span>{" "}
            olsun.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-cream/60">
            Saniyeler içinde talebinizi oluşturun, ekibimiz sizinle iletişime
            geçsin.
          </p>
          <Button href="/rezervasyon" size="lg" className="mt-8">
            Rezervasyon Oluştur
          </Button>
        </div>
      </section>
    </>
  );
}
