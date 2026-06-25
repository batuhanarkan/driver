import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

export default function GizlilikPage() {
  return (
    <section className="container-px mx-auto max-w-3xl py-20 md:py-28">
      <header className="animate-rise">
        <p className="text-sm uppercase tracking-[0.28em] text-gold/70">
          Yasal
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">Gizlilik Politikası</h1>
        <p className="mt-5 leading-relaxed text-cream/65">
          VipDrive olarak, hizmetlerimizden yararlanırken bizimle paylaştığınız
          kişisel verilerin gizliliğine önem veriyoruz. Bu metin, hangi
          bilgileri topladığımızı, bu bilgileri neden ve nasıl işlediğimizi ve
          bu konudaki haklarınızı açıklamak için hazırlanmıştır.
        </p>
        <p className="mt-3 text-sm text-cream/45">Son güncelleme: Haziran 2026</p>
      </header>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-2xl text-cream">1. Topladığımız Kişisel Veriler</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Rezervasyon oluşturduğunuzda, hesap açtığınızda veya bizimle
            iletişime geçtiğinizde adınız, soyadınız, telefon numaranız,
            e-posta adresiniz gibi sizi tanımlayan bilgileri toplayabiliriz.
            Ayrıca yolculuk talebinizin gereği olarak alış-bırakış noktaları,
            tarih ve saat bilgileri ile hizmete ilişkin özel notlarınızı da
            işleriz. Web sitemizi kullanırken cihaz ve tarayıcı bilgileri gibi
            teknik veriler otomatik olarak kaydedilebilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">2. Verilerin Kullanım Amaçları</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Kişisel verilerinizi; talep ettiğiniz hizmeti planlamak ve sunmak,
            sizinle iletişim kurmak, rezervasyon sürecini yönetmek, hizmet
            kalitemizi iyileştirmek ve yasal yükümlülüklerimizi yerine getirmek
            amacıyla işleriz. Açık rızanız bulunması hâlinde, size özel
            kampanya ve bilgilendirmeleri iletmek için de kullanabiliriz.
            Verilerinizi yalnızca bu amaçlarla sınırlı ve ölçülü biçimde
            işleriz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">3. Çerezler</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Web sitemiz, deneyiminizi geliştirmek ve temel işlevleri sağlamak
            amacıyla çerezler ve benzeri teknolojiler kullanabilir. Çerezler;
            oturumunuzu sürdürmek, tercihlerinizi hatırlamak ve site
            kullanımına ilişkin anonim istatistikler elde etmek için
            kullanılır. Tarayıcınızın ayarları üzerinden çerezleri
            yönetebilir veya engelleyebilirsiniz; ancak bu durumda bazı
            özellikler beklendiği gibi çalışmayabilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">4. Verilerin Paylaşımı</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Kişisel verilerinizi pazarlama amacıyla üçüncü taraflara satmayız.
            Verileriniz yalnızca talep ettiğiniz hizmetin yürütülmesi için
            gerekli olduğu ölçüde, hizmeti sağlayan ekip ve iş ortaklarımızla
            ya da yasal bir zorunluluk hâlinde yetkili kamu kurumlarıyla
            paylaşılabilir. Bu paylaşımlarda gizlilik ve güvenlik ilkelerine
            bağlı kalınması esastır.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">5. Veri Güvenliği</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Kişisel verilerinizi yetkisiz erişime, kayba ve kötüye kullanıma
            karşı korumak için makul teknik ve idari tedbirleri uygularız.
            Verilere erişimi yalnızca görevi gereği ihtiyaç duyan kişilerle
            sınırlandırır, verileri işleme amacının gerektirdiği süre boyunca
            saklarız. Sürenin sonunda verileriniz mevzuata uygun şekilde
            silinir, yok edilir veya anonim hâle getirilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">6. Haklarınız</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            İlgili mevzuat kapsamında; kişisel verilerinizin işlenip
            işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
            işlenme amacını öğrenme, eksik veya yanlış işlenmiş verilerin
            düzeltilmesini isteme, verilerinizin silinmesini veya yok
            edilmesini talep etme ve işlemeye açık rızanızı geri alma haklarına
            sahipsiniz. Taleplerinizi aşağıdaki iletişim kanalları üzerinden
            bize iletebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">7. İletişim</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Bu gizlilik politikası veya kişisel verilerinizin işlenmesine
            ilişkin her türlü soru, talep ve başvurunuz için iletişim
            sayfamızdaki kanallar aracılığıyla bizimle her zaman irtibata
            geçebilirsiniz. Başvurularınızı en kısa sürede ve mevzuatta
            öngörülen süreler içinde yanıtlamaya özen gösteririz.
          </p>
        </section>
      </div>

      <p className="mt-14 rounded-[var(--radius)] border hairline bg-surface/30 px-6 py-5 text-sm leading-relaxed text-cream/50">
        Bu metin örnek amaçlıdır ve yasal danışmanlık niteliği taşımaz. Kurumsal
        gizlilik politikanız için bir hukuk uzmanından destek almanızı öneririz.
      </p>
    </section>
  );
}
