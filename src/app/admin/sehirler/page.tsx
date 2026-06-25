import { db } from "@/lib/db";
import { getCitiesForAdmin } from "@/lib/cities";
import { PageHeader } from "@/components/admin/PageHeader";
import { CityManager } from "./CityManager";

export default async function SehirlerPage() {
  const [cities, services] = await Promise.all([
    getCitiesForAdmin(),
    db.service.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, baslik: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Şehirler"
        desc="Şehirleri, lokasyonları ve hangi hizmetin nerede sunulduğunu yönet."
      />
      <CityManager cities={cities} services={services} />
    </>
  );
}
