import type { Metadata } from "next";
import { LeadForm } from "@/components/site/LeadForm";

export const metadata: Metadata = { title: "Kurumsal" };

const COZUMLER = [
  {
    baslik: "Filo yönetimi",
    aciklama:
      "Şirketinizin tüm ulaşım operasyonunu tek elden planlıyor, araç ve şoför tahsisini ihtiyaçlarınıza göre kurguluyoruz.",
  },
  {
    baslik: "Aylık paketler",
    aciklama:
      "Yoğunluğunuza uygun, esnek aylık kullanım paketleriyle öngörülebilir maliyet ve kesintisiz hizmet sunuyoruz.",
  },
  {
    baslik: "Kurumsal faturalandırma",
    aciklama:
      "Tüm yolculuklarınız tek bir hesapta toplanır; düzenli, şeffaf ve muhasebenize hazır faturalandırma yapılır.",
  },
  {
    baslik: "Özel şoför tahsisi",
    aciklama:
      "Yöneticileriniz ve misafirleriniz için, ekibinizi tanıyan, çok dilli ve diskret profesyonel şoförler tahsis ediyoruz.",
  },
];

export default function KurumsalPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-20 md:py-28">
      <div className="max-w-2xl animate-rise">
        <p className="text-sm uppercase tracking-[0.28em] text-gold/70">
          Kurumsal Çözümler
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">
          Markanıza yakışan kurumsal ulaşım
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-cream/65">
          VipDrive Kurumsal, şirketinizin günlük operasyonundan üst düzey misafir
          ağırlamaya kadar her ihtiyaca tek bir partnerle yanıt verir. Konforu,
          dakikliği ve gizliliği kurumsal standartlarda garanti ediyoruz.
        </p>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius)] border hairline sm:grid-cols-2">
        {COZUMLER.map((c) => (
          <div key={c.baslik} className="bg-surface/40 p-7">
            <h3 className="text-xl text-cream">{c.baslik}</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/55">
              {c.aciklama}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <h2 className="text-3xl md:text-4xl">Size özel teklif hazırlayalım</h2>
          <p className="mt-4 leading-relaxed text-cream/60">
            Şirketinizin ulaşım hacmini ve beklentilerinizi paylaşın; ekibimiz
            ihtiyaçlarınıza göre kurgulanmış bir teklifle size dönsün.
          </p>
        </div>

        <LeadForm
          tip="KURUMSAL"
          mesajLabel="İhtiyacınız"
          mesajPlaceholder="Şirketiniz ve ulaşım ihtiyaçlarınız hakkında kısaca..."
          submitLabel="Teklif İste"
        />
      </div>
    </section>
  );
}
