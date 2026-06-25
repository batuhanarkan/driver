import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { VehicleManager } from "./VehicleManager";

export default async function AraclarPage() {
  const vehicles = await db.vehicle.findMany({ orderBy: { fiyat: "asc" } });

  const plain = vehicles.map((v) => ({
    id: v.id,
    ad: v.ad,
    sinif: v.sinif as "EKONOMI" | "BUSINESS" | "VAN" | "LUKS",
    kapasite: v.kapasite,
    fiyat: v.fiyat,
    aktif: v.aktif,
  }));

  return (
    <>
      <PageHeader title="Araçlar" desc="Filo ve fiyat farklarını yönet." />
      <VehicleManager vehicles={plain} />
    </>
  );
}
