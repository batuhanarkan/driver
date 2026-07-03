import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { HeroSearch } from "@/components/site/HeroSearch";
import { getServices, getActiveCampaigns, CATEGORY_META } from "@/lib/services";
import { getProvinces } from "@/lib/geo";
import { formatTRY } from "@/lib/format";

// İçerik DB'den gelir; her istekte taze render (build'de DB'ye bağımlı olmasın,
// admin değişiklikleri anında yansısın).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, campaigns, provinces] = await Promise.all([
    getServices(),
    getActiveCampaigns(),
    getProvinces(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b hairline">
        {/* yumuşak arka plan + sade silüet */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-ink-2/70 via-ink to-ink" />
          <svg
            className="absolute inset-x-0 bottom-0 h-40 w-full text-gold/[0.07]"
            viewBox="0 0 1200 160"
            preserveAspectRatio="none"
            fill="currentColor"
            aria-hidden
          >
            <path d="M0 160 V96 h60 v-22 h26 v22 h40 V70 h22 v90 z" />
            <path d="M180 160 V60 h34 v-30 h18 v30 h30 v40 h28 v60 z" />
            <path d="M340 160 V84 h44 v-18 h22 v18 h38 v76 z" />
            <path d="M500 160 V54 h30 v-26 h16 v26 h34 v44 h26 v56 z" />
            <path d="M660 160 V92 h52 v-26 h22 v26 h36 v68 z" />
            <path d="M820 160 V64 h32 v-34 h18 v34 h30 v38 h26 v58 z" />
            <path d="M980 160 V88 h46 v-20 h22 v20 h40 v72 z" />
            <path d="M1140 160 V98 h44 v62 z" />
          </svg>
        </div>

        <div className="container-px above mx-auto max-w-5xl py-20 text-center md:py-28">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border hairline bg-white/70 px-4 py-1.5 text-xs font-medium text-cream/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Türkiye geneli premium ulaşım
          </span>

          <h1
            className="animate-rise mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] md:text-6xl"
            style={{ animationDelay: "0.06s" }}
          >
            Nereye giderseniz gidin,{" "}
            <span className="gold-text">şoförünüz hazır.</span>
          </h1>

          <p
            className="animate-rise mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream/60"
            style={{ animationDelay: "0.12s" }}
          >
            Şoförlü araç, havalimanı transferi, tur ve VIP karşılama — birkaç
            saniyede planlayın, gerisini biz halledelim.
          </p>

          <div
            className="animate-rise mx-auto mt-9 text-left"
            style={{ animationDelay: "0.18s" }}
          >
            <HeroSearch
              provinces={provinces.map((p) => ({ id: p.id, ad: p.ad, slug: p.slug }))}
              services={services.map((s) => ({
                id: s.id,
                slug: s.slug,
                baslik: s.baslik,
                kategori: s.kategori,
              }))}
            />
          </div>

          <div
            className="animate-rise mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-cream/55"
            style={{ animationDelay: "0.24s" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gold">✓</span> Ücretsiz iptal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gold">✓</span> Sabit fiyat, sürpriz yok
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-gold">✓</span> 7/24 destek
            </span>
          </div>
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
                {c.service && (
                  <p className="mt-3 text-xs uppercase tracking-wide text-gold/70">
                    {c.service.baslik}
                  </p>
                )}
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
