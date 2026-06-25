import { db } from "@/lib/db";

/** Hero arama için: aktif şehirler + her şehrin hizmetleri ve lokasyonları. */
export async function getCitiesForSearch() {
  return db.city.findMany({
    where: { aktif: true },
    orderBy: { siralama: "asc" },
    include: {
      services: {
        where: { aktif: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, slug: true, baslik: true, kategori: true },
      },
      locations: {
        where: { aktif: true },
        orderBy: { ad: "asc" },
        select: { id: true, ad: true, tip: true },
      },
    },
  });
}

/** Admin listesi: tüm şehirler + sayımlar. */
export async function getCitiesForAdmin() {
  return db.city.findMany({
    orderBy: { siralama: "asc" },
    include: {
      services: { select: { id: true } },
      locations: { orderBy: { ad: "asc" } },
      _count: { select: { locations: true, services: true } },
    },
  });
}

export async function getCityBySlug(slug: string) {
  return db.city.findUnique({
    where: { slug },
    include: { services: true, locations: { where: { aktif: true } } },
  });
}
