import type { Metadata } from "next";
import { LeadForm } from "@/components/site/LeadForm";

export const metadata: Metadata = { title: "Kariyer" };

const POZISYONLAR = [
  {
    baslik: "Profesyonel Şoför",
    aciklama:
      "Üst segment araç deneyimi, temsil yeteneği ve misafir odaklı yaklaşımıyla yolculuğun her anını kusursuz kılan sürücüler arıyoruz.",
  },
  {
    baslik: "Özel Rehber",
    aciklama:
      "İstanbul'u ve ötesini tutkuyla anlatan, çok dilli ve misafirlere unutulmaz deneyimler yaşatan rehberleri ekibimize davet ediyoruz.",
  },
  {
    baslik: "Operasyon Uzmanı",
    aciklama:
      "Planlamadan koordinasyona, her talebi zamanında ve eksiksiz yöneten, detaylara hâkim operasyon profesyonelleri arıyoruz.",
  },
];

export default function KariyerPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-20 md:py-28">
      <div className="max-w-2xl animate-rise">
        <p className="text-sm uppercase tracking-[0.28em] text-gold/70">
          Kariyer
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">Bizimle çalışır mısınız?</h1>
        <p className="mt-5 text-lg leading-relaxed text-cream/65">
          VipDrive, ayrıcalıklı hizmeti detaylara gösterilen özenle buluşturan bir
          ekiptir. Misafir memnuniyetini bir tutku olarak görüyor, işini
          ustalıkla yapan profesyonellerle yola devam etmek istiyoruz. Sizi de
          aramızda görmek isteriz.
        </p>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius)] border hairline sm:grid-cols-3">
        {POZISYONLAR.map((p) => (
          <div key={p.baslik} className="bg-surface/40 p-7">
            <h3 className="text-xl text-cream">{p.baslik}</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/55">
              {p.aciklama}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <h2 className="text-3xl md:text-4xl">Başvurunuzu bekliyoruz</h2>
          <p className="mt-4 leading-relaxed text-cream/60">
            Deneyiminizi ve neden VipDrive ailesinin bir parçası olmak
            istediğinizi paylaşın. Uygun pozisyonlar için sizinle iletişime
            geçelim.
          </p>
        </div>

        <LeadForm
          tip="KARIYER"
          mesajLabel="Neden bize katılmak istiyorsunuz?"
          mesajPlaceholder="Deneyiminiz ve başvurduğunuz pozisyon..."
          submitLabel="Başvur"
        />
      </div>
    </section>
  );
}
