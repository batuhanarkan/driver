import { db } from "@/lib/db";

/** Rezervasyon/hero için 81 il (alfabetik). */
export async function getProvinces() {
  return db.province.findMany({
    orderBy: { ad: "asc" },
    select: { id: true, ad: true, slug: true, plaka: true, lat: true, lng: true },
  });
}

export type ProvinceLite = Awaited<ReturnType<typeof getProvinces>>[number];

/** Bir ilin ilçeleri (alfabetik). Client kaskad için server action ile çağrılır. */
export async function getDistrictsByProvince(provinceId: string) {
  if (!provinceId) return [];
  return db.district.findMany({
    where: { provinceId },
    orderBy: { ad: "asc" },
    select: { id: true, ad: true },
  });
}
