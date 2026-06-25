import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceManager } from "./ServiceManager";

export default async function HizmetlerPage() {
  const rows = await db.service.findMany({ orderBy: { createdAt: "asc" } });

  const services = rows.map((s) => ({
    id: s.id,
    slug: s.slug,
    kategori: s.kategori,
    baslik: s.baslik,
    aciklama: s.aciklama,
    temelFiyat: s.temelFiyat,
    aktif: s.aktif,
  }));

  return (
    <>
      <PageHeader title="Hizmetler" desc="Hizmet ve fiyatları yönet." />
      <ServiceManager services={services} />
    </>
  );
}
