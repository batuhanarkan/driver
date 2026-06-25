import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { CampaignManager } from "./CampaignManager";

export default async function KampanyalarPage() {
  const rows = await db.campaign.findMany({ orderBy: { createdAt: "desc" } });

  const campaigns = rows.map((c) => ({
    id: c.id,
    baslik: c.baslik,
    aciklama: c.aciklama,
    indirimYuzde: c.indirimYuzde,
    aktif: c.aktif,
  }));

  return (
    <>
      <PageHeader title="Kampanyalar" desc="Fırsatları yönet." />
      <CampaignManager campaigns={campaigns} />
    </>
  );
}
