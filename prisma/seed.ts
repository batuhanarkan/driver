import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const db = new PrismaClient();

/** Türkçe karakterleri ASCII'ye indirger, slug üretir. */
function slugify(s: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", i: "i", İ: "i", ö: "o", ş: "s", ü: "u",
  };
  return s
    .toLowerCase()
    .replace(/[çğıiİöşü]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "istanbul" -> "İstanbul", "çukurova" -> "Çukurova" (Türkçe locale ile). */
function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) =>
      w.length ? w[0].toLocaleUpperCase("tr-TR") + w.slice(1) : w,
    )
    .join(" ");
}

/** Büyük harf dahil sağlam eşleştirme anahtarı (İ/I/ı → i). */
function norm(s: string): string {
  return s
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "AKKAYA KÖYÜ" -> "Akkaya Köyü" (büyük harf girdiyi düzgün başlıklar). */
function properCase(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toLocaleUpperCase("tr-TR") + w.slice(1) : w))
    .join(" ");
}

type RawCity = {
  name: string;
  plate: string;
  latitude: string;
  longitude: string;
  counties: string[];
};

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

  // aktif=false olanlar siteden gizlenir (DB'de durur, admin'den açılabilir).
  // Görünürlük burada koddan yönetilir — geri açmak için aktif'i true yapıp push.
  const hizmetler = [
    { slug: "soforlu-arac", kategori: "CHAUFFEUR", baslik: "Şoförlü Araç", aciklama: "Profesyonel şoför eşliğinde özel araç.", temelFiyat: 2500, aktif: true },
    { slug: "transfer", kategori: "TRANSFER", baslik: "Transfer", aciklama: "Havalimanı ve otel transferleri.", temelFiyat: 1200, aktif: true },
    { slug: "turlar", kategori: "TOUR", baslik: "Turlar", aciklama: "Rehberli şehir ve bölge turları.", temelFiyat: 3500, aktif: false },
    { slug: "ozel-rehberlik", kategori: "GUIDE", baslik: "Özel Rehberlik", aciklama: "Uzman rehber hizmeti.", temelFiyat: 1800, aktif: false },
    { slug: "selamlama", kategori: "GREETING", baslik: "Selamlama ve Karşılama", aciklama: "Havalimanı karşılama ve VIP yönlendirme.", temelFiyat: 900, aktif: false },
  ] as const;

  for (const h of hizmetler) {
    await db.service.upsert({
      where: { slug: h.slug },
      update: { aktif: h.aktif },
      create: { ...h, gorseller: [] },
    });
  }

  // Araç filosu — yoksa ekle
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

  // 81 il + ilçeler — yoksa ekle (kaynak: enisbt/turkey-cities)
  if ((await db.province.count()) === 0) {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "prisma", "data", "tr-cities.json"), "utf-8"),
    ) as RawCity[];

    for (const c of raw) {
      const ilceler = Array.from(new Set(c.counties.map(titleCase)));
      await db.province.create({
        data: {
          ad: titleCase(c.name),
          slug: slugify(c.name),
          plaka: parseInt(c.plate, 10),
          lat: parseFloat(c.latitude),
          lng: parseFloat(c.longitude),
          districts: { create: ilceler.map((ad) => ({ ad })) },
        },
      });
    }
  }

  // Mahalleler — yoksa ekle (kaynak: bertugfahriozer/il_ilce_mahalle, resmi/TÜİK)
  // { İL: { İLÇE: ["X Mah.", ...] } } yapısı, mevcut ilçelere isimle eşleştirilir.
  if ((await db.neighborhood.count()) === 0) {
    const mraw = JSON.parse(
      readFileSync(join(process.cwd(), "prisma", "data", "tr-mahalle.json"), "utf-8"),
    ) as Record<string, Record<string, string[]>>;

    const dists = await db.district.findMany({
      include: { province: { select: { ad: true } } },
    });
    const dmap = new Map<string, string>();
    for (const d of dists) dmap.set(`${norm(d.province.ad)}|${norm(d.ad)}`, d.id);

    const rows: { ad: string; districtId: string }[] = [];
    let eslesen = 0;
    let atlanan = 0;
    for (const [ilAd, ilceler] of Object.entries(mraw)) {
      const pn = norm(ilAd);
      for (const [ilceAd, mahalleler] of Object.entries(ilceler)) {
        const did = dmap.get(`${pn}|${norm(ilceAd)}`);
        if (!did) {
          atlanan++;
          continue;
        }
        eslesen++;
        // "SUADİYE Mah." -> "Suadiye" (sondaki Mah./Mahallesi ekini at)
        const uniq = Array.from(
          new Set(mahalleler.map((mh) => properCase(mh.replace(/\s*mah(\.|allesi)?\s*$/i, "")))),
        );
        for (const ad of uniq) rows.push({ ad, districtId: did });
      }
    }
    for (let i = 0; i < rows.length; i += 5000) {
      await db.neighborhood.createMany({ data: rows.slice(i, i + 5000) });
    }
    console.log(
      `Mahalle: ${rows.length} kayıt (eşleşen ilçe ${eslesen}, atlanan ${atlanan})`,
    );
  }

  const ilSayisi = await db.province.count();
  const ilceSayisi = await db.district.count();
  const mahalleSayisi = await db.neighborhood.count();
  console.log(
    `Seed tamamlandı: 1 admin + 5 hizmet + 4 araç + 3 kampanya + ${ilSayisi} il + ${ilceSayisi} ilçe + ${mahalleSayisi} mahalle`,
  );
}

main().finally(() => db.$disconnect());
