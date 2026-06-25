import { db } from "@/lib/db";
import type { ServiceCategory } from "@prisma/client";

/** Kategori bazlı sunum metası (ikon, kısa slogan, vurgu görsel tonu). */
export const CATEGORY_META: Record<
  ServiceCategory,
  { tagline: string; hero: string; icon: string; ozellikler: string[] }
> = {
  CHAUFFEUR: {
    tagline: "Direksiyonda bir profesyonel, arkada siz.",
    hero: "Üst sınıf araç ve deneyimli şoförle şehirde ayrıcalıklı seyahat.",
    icon: "steering",
    ozellikler: ["Üst segment araç filosu", "Çok dilli profesyonel şoför", "Saatlik veya günlük"],
  },
  TRANSFER: {
    tagline: "Kapıdan kapıya, dakika şaşmadan.",
    hero: "Havalimanı ve oteller arası kesintisiz, konforlu transfer.",
    icon: "route",
    ozellikler: ["Uçuş takibi", "Karşılama tabelası", "Sabit fiyat"],
  },
  TOUR: {
    tagline: "Şehri bir yerelin gözünden keşfedin.",
    hero: "Özenle kurgulanmış rotalar, rehberli şehir ve bölge turları.",
    icon: "compass",
    ozellikler: ["Özel rota planı", "Uzman rehber", "Esnek program"],
  },
  GUIDE: {
    tagline: "Bilgiye değer katan rehberlik.",
    hero: "Alanında uzman, lisanslı özel rehberlerle derinlemesine deneyim.",
    icon: "book",
    ozellikler: ["Lisanslı rehberler", "Tematik turlar", "Birebir ilgi"],
  },
  GREETING: {
    tagline: "İlk adımdan itibaren ağırlanın.",
    hero: "Havalimanında VIP karşılama, yönlendirme ve hızlı geçiş desteği.",
    icon: "sparkle",
    ozellikler: ["VIP karşılama", "Bagaj desteği", "Hızlı yönlendirme"],
  },
};

export const CATEGORY_ORDER: ServiceCategory[] = [
  "CHAUFFEUR",
  "TRANSFER",
  "TOUR",
  "GUIDE",
  "GREETING",
];

export async function getServices() {
  return db.service.findMany({
    where: { aktif: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getServiceBySlug(slug: string) {
  return db.service.findUnique({ where: { slug } });
}

export async function getVehicles() {
  return db.vehicle.findMany({ where: { aktif: true }, orderBy: { fiyat: "asc" } });
}

export async function getActiveCampaigns() {
  return db.campaign.findMany({
    where: { aktif: true },
    orderBy: { createdAt: "desc" },
  });
}
