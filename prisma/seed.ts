import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = "admin@vipdrive.com";
  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      ad: "VipDrive Admin",
      email: adminEmail,
      sifreHash: await bcrypt.hash("admin123", 10),
      rol: "ADMIN",
    },
  });

  const hizmetler = [
    { slug: "soforlu-arac", kategori: "CHAUFFEUR", baslik: "Şoförlü Araç", aciklama: "Profesyonel şoför eşliğinde özel araç.", temelFiyat: 2500 },
    { slug: "transfer", kategori: "TRANSFER", baslik: "Transfer", aciklama: "Havalimanı ve otel transferleri.", temelFiyat: 1200 },
    { slug: "turlar", kategori: "TOUR", baslik: "Turlar", aciklama: "Rehberli şehir ve bölge turları.", temelFiyat: 3500 },
    { slug: "ozel-rehberlik", kategori: "GUIDE", baslik: "Özel Rehberlik", aciklama: "Uzman rehber hizmeti.", temelFiyat: 1800 },
    { slug: "selamlama", kategori: "GREETING", baslik: "Selamlama ve Karşılama", aciklama: "Havalimanı karşılama ve VIP yönlendirme.", temelFiyat: 900 },
  ] as const;

  for (const h of hizmetler) {
    await db.service.upsert({
      where: { slug: h.slug },
      update: {},
      create: { ...h, gorseller: [] },
    });
  }

  // Araç filosu (şoförlü araç & transfer için) — yoksa ekle
  if ((await db.vehicle.count()) === 0) {
    await db.vehicle.createMany({
      data: [
        { ad: "Ekonomik Sedan", sinif: "EKONOMI", kapasite: 4, fiyat: 0 },
        { ad: "Mercedes E-Serisi", sinif: "BUSINESS", kapasite: 3, fiyat: 500 },
        { ad: "Mercedes Vito VIP", sinif: "VAN", kapasite: 6, fiyat: 800 },
        { ad: "Mercedes S-Serisi", sinif: "LUKS", kapasite: 3, fiyat: 1500 },
      ],
    });
  }

  // Kampanyalar — yoksa ekle
  if ((await db.campaign.count()) === 0) {
    await db.campaign.createMany({
      data: [
        { baslik: "Havalimanı Transferinde %15", aciklama: "İlk transfer rezervasyonunuzda geçerli avantaj.", indirimYuzde: 15 },
        { baslik: "Kurumsal Anlaşma Avantajı", aciklama: "Şirketinize özel aylık ulaşım paketleri.", indirimYuzde: 0 },
        { baslik: "Hafta Sonu Şehir Turu", aciklama: "Rehberli İstanbul turlarında özel fiyat.", indirimYuzde: 10 },
      ],
    });
  }

  // Şehirler + lokasyonlar + hizmet-şehir bağı — yoksa ekle
  if ((await db.city.count()) === 0) {
    const hizmetler = await db.service.findMany({ select: { id: true, slug: true } });
    const idOf = (slug: string) => hizmetler.find((h) => h.slug === slug)!.id;

    const sehirler = [
      {
        ad: "İstanbul", slug: "istanbul", siralama: 1,
        hizmet: ["soforlu-arac", "transfer", "turlar", "ozel-rehberlik", "selamlama"],
        lokasyon: [
          { ad: "İstanbul Havalimanı (IST)", tip: "HAVALIMANI" },
          { ad: "Sabiha Gökçen Havalimanı (SAW)", tip: "HAVALIMANI" },
          { ad: "Taksim", tip: "SEMT" },
          { ad: "Beşiktaş", tip: "SEMT" },
          { ad: "Sultanahmet", tip: "SEMT" },
          { ad: "Kadıköy", tip: "SEMT" },
        ],
      },
      {
        ad: "Ankara", slug: "ankara", siralama: 2,
        hizmet: ["soforlu-arac", "transfer", "turlar"],
        lokasyon: [
          { ad: "Esenboğa Havalimanı (ESB)", tip: "HAVALIMANI" },
          { ad: "Kızılay", tip: "SEMT" },
          { ad: "Çankaya", tip: "SEMT" },
        ],
      },
      {
        ad: "İzmir", slug: "izmir", siralama: 3,
        hizmet: ["soforlu-arac", "transfer", "turlar", "selamlama"],
        lokasyon: [
          { ad: "Adnan Menderes Havalimanı (ADB)", tip: "HAVALIMANI" },
          { ad: "Alsancak", tip: "SEMT" },
          { ad: "Çeşme", tip: "SEMT" },
        ],
      },
      {
        ad: "Antalya", slug: "antalya", siralama: 4,
        hizmet: ["transfer", "turlar", "ozel-rehberlik"],
        lokasyon: [
          { ad: "Antalya Havalimanı (AYT)", tip: "HAVALIMANI" },
          { ad: "Lara", tip: "SEMT" },
          { ad: "Belek", tip: "SEMT" },
          { ad: "Kaleiçi", tip: "SEMT" },
        ],
      },
    ] as const;

    for (const s of sehirler) {
      await db.city.create({
        data: {
          ad: s.ad,
          slug: s.slug,
          siralama: s.siralama,
          services: { connect: s.hizmet.map((slug) => ({ id: idOf(slug) })) },
          locations: { create: s.lokasyon.map((l) => ({ ad: l.ad, tip: l.tip })) },
        },
      });
    }
  }

  console.log(
    "Seed tamamlandı: 1 admin + 5 hizmet + 4 araç + 3 kampanya + 4 şehir",
  );
}

main().finally(() => db.$disconnect());
