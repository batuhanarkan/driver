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

  console.log("Seed tamamlandı: 1 admin + 5 hizmet + 4 araç + 3 kampanya");
}

main().finally(() => db.$disconnect());
