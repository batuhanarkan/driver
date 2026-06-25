import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kullanım Şartları" };

export default function SartlarPage() {
  return (
    <section className="container-px mx-auto max-w-3xl py-20 md:py-28">
      <header className="animate-rise">
        <p className="text-sm uppercase tracking-[0.28em] text-gold/70">
          Yasal
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">Kullanım Şartları</h1>
        <p className="mt-5 leading-relaxed text-cream/65">
          Bu kullanım şartları, VipDrive web sitesini ve hizmetlerini
          kullanımınıza ilişkin koşulları düzenler. Sitemizi kullanarak ve
          rezervasyon talebi oluşturarak aşağıdaki şartları kabul etmiş
          sayılırsınız. Lütfen bu metni dikkatlice okuyun.
        </p>
        <p className="mt-3 text-sm text-cream/45">Son güncelleme: Haziran 2026</p>
      </header>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-2xl text-cream">1. Hizmet Kapsamı</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            VipDrive; şoförlü araç, havalimanı transferi, özel turlar,
            rehberlik ve VIP karşılama gibi premium ulaşım hizmetlerinin
            organizasyonunu sunar. Web sitemiz, bu hizmetlere ilişkin bilgi
            almanızı ve talep oluşturmanızı sağlayan dijital bir aracıdır.
            Hizmetlerin kapsamı, güzergâh ve detaylar talebinize göre
            belirlenir ve ekibimizce teyit edilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">2. Üyelik ve Hesap</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Bazı özelliklerden yararlanmak için hesap oluşturmanız gerekebilir.
            Hesap açarken verdiğiniz bilgilerin doğru ve güncel olmasından siz
            sorumlusunuz. Hesap güvenliğiniz ve giriş bilgilerinizin gizliliği
            sizin sorumluluğunuzdadır; hesabınız üzerinden gerçekleştirilen
            işlemlerden sizin sorumlu olduğunuzu kabul edersiniz. Yetkisiz bir
            kullanım fark ederseniz bizi bilgilendirmenizi rica ederiz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">3. Sipariş ve Talep Süreci</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Web sitemiz üzerinden oluşturduğunuz talepler bir hizmet talebi
            niteliğindedir ve site üzerinden herhangi bir ödeme tahsil edilmez.
            Talebiniz bize ulaştıktan sonra ekibimiz uygunluk, fiyat ve detaylar
            için sizinle iletişime geçer. Hizmet, ancak karşılıklı teyitten
            sonra kesinleşir. Bu nedenle siteden gönderilen bir talep, tek
            başına bağlayıcı bir sözleşme oluşturmaz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">4. İptal ve Değişiklik</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Teyit edilmiş bir hizmete ilişkin iptal veya değişiklik taleplerinizi
            mümkün olan en kısa sürede bize iletmenizi rica ederiz. İptal ve
            değişiklik koşulları, hizmetin türüne ve zamanlamasına göre
            farklılık gösterebilir; bu koşullar teyit aşamasında sizinle
            paylaşılır. Erken bilgilendirme, sizin için en uygun çözümü
            sunmamıza yardımcı olur.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">5. Sorumluluk Sınırı</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Hizmetlerimizi özen ve profesyonellikle sunmak için elimizden geleni
            yaparız. Bununla birlikte; trafik, hava koşulları, mücbir sebepler
            veya kontrolümüz dışındaki üçüncü taraf etkenlerden kaynaklanan
            gecikme ya da aksaklıklardan doğabilecek dolaylı zararlardan sorumlu
            tutulamayız. Web sitesindeki bilgiler iyi niyetle ve güncel tutularak
            sağlanır; ancak içerikte zaman zaman değişiklik olabilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">6. Fikri Mülkiyet</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            VipDrive markası, logosu, metinleri, görselleri ve site tasarımı
            dâhil tüm içerik fikri mülkiyet haklarıyla korunmaktadır. Bu
            içerikler, yazılı iznimiz olmaksızın kopyalanamaz, çoğaltılamaz veya
            ticari amaçla kullanılamaz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">7. Şartlardaki Değişiklikler</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Bu kullanım şartlarını zaman zaman güncelleyebiliriz. Güncel sürüm
            bu sayfada yayımlandığı andan itibaren geçerli olur. Değişikliklerin
            yürürlüğe girmesinden sonra hizmetlerimizi kullanmaya devam etmeniz,
            güncel şartları kabul ettiğiniz anlamına gelir. Şartları düzenli
            olarak gözden geçirmenizi öneririz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-cream">8. İletişim</h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Kullanım şartlarına ilişkin soru ve görüşlerinizi iletişim
            sayfamızdaki kanallar aracılığıyla bize iletebilirsiniz. Geri
            bildirimleriniz, hizmet kalitemizi geliştirmemize katkı sağlar.
          </p>
        </section>
      </div>

      <p className="mt-14 rounded-[var(--radius)] border hairline bg-surface/30 px-6 py-5 text-sm leading-relaxed text-cream/50">
        Bu metin örnek amaçlıdır ve yasal danışmanlık niteliği taşımaz. Kurumsal
        kullanım şartlarınız için bir hukuk uzmanından destek almanızı öneririz.
      </p>
    </section>
  );
}
