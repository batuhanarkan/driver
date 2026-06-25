import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { CampaignManager } from "./CampaignManager";

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function KampanyalarPage() {
  const [rows, services] = await Promise.all([
    db.campaign.findMany({
      include: { service: true },
      orderBy: { createdAt: "desc" },
    }),
    db.service.findMany({
      where: { aktif: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, baslik: true },
    }),
  ]);

  const campaigns = rows.map((c) => ({
    id: c.id,
    baslik: c.baslik,
    aciklama: c.aciklama,
    indirimYuzde: c.indirimYuzde,
    aktif: c.aktif,
    serviceId: c.serviceId,
    serviceBaslik: c.service?.baslik ?? null,
    baslangic: toLocalInput(c.baslangic),
    bitis: toLocalInput(c.bitis),
  }));

  return (
    <>
      <PageHeader
        title="Kampanyalar"
        desc="Fırsatları yönet — hizmete bağla, geçerlilik tarihi ver."
      />
      <CampaignManager campaigns={campaigns} services={services} />
    </>
  );
}
