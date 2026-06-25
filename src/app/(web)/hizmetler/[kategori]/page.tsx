import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import {
  getServiceBySlug,
  getServices,
  CATEGORY_META,
} from "@/lib/services";
import { formatTRY } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const service = await getServiceBySlug(kategori);
  return { title: service?.baslik ?? "Hizmet" };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const service = await getServiceBySlug(kategori);
  if (!service) notFound();

  const meta = CATEGORY_META[service.kategori];
  const others = (await getServices()).filter((s) => s.id !== service.id);

  return (
    <>
      <section className="container-px mx-auto max-w-7xl py-20 md:py-28">
        <Link
          href="/#hizmetler"
          className="text-sm text-cream/50 transition hover:text-gold"
        >
          ← Tüm hizmetler
        </Link>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div className="animate-rise">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 text-gold">
              <ServiceIcon name={meta.icon} className="h-7 w-7" />
            </span>
            <h1 className="mt-7 text-5xl md:text-6xl">{service.baslik}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/65">
              {meta.hero}
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-cream/55">
              {service.aciklama}
            </p>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {meta.ozellikler.map((o) => (
                <li
                  key={o}
                  className="flex items-center gap-3 rounded-full border hairline bg-surface/40 px-5 py-3 text-sm text-cream/75"
                >
                  <span className="text-gold">✓</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          {/* fiyat & rezervasyon kartı */}
          <aside className="animate-rise lg:sticky lg:top-28 lg:self-start" style={{ animationDelay: "0.12s" }}>
            <div className="glass rounded-[var(--radius)] p-8">
              <p className="text-sm text-cream/55">Başlangıç fiyatı</p>
              <p className="mt-1 font-display text-4xl text-gold">
                {formatTRY(service.temelFiyat)}
              </p>
              <p className="mt-2 text-xs text-cream/45">
                Nihai fiyat talep detaylarına göre belirlenir.
              </p>
              <Button
                href={`/rezervasyon?hizmet=${service.slug}`}
                size="lg"
                className="mt-7 w-full"
              >
                Bu Hizmeti Talep Et
              </Button>
              <Link
                href="/iletisim"
                className="mt-4 block text-center text-sm text-cream/50 transition hover:text-gold"
              >
                Sorularınız mı var? İletişime geçin
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* diğer hizmetler */}
      <section className="border-t hairline">
        <div className="container-px mx-auto max-w-7xl py-16">
          <h2 className="text-2xl text-cream/80">Diğer hizmetler</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <Link
                key={s.id}
                href={`/hizmetler/${s.slug}`}
                className="group rounded-[var(--radius)] border hairline bg-surface/30 p-6 transition hover:border-gold/40"
              >
                <span className="text-gold">
                  <ServiceIcon name={CATEGORY_META[s.kategori].icon} />
                </span>
                <h3 className="mt-4 text-lg">{s.baslik}</h3>
                <p className="mt-2 text-sm text-cream/50">
                  {formatTRY(s.temelFiyat)}'den
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
