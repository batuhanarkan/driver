import { db } from "@/lib/db";
import { formatTRY } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { STATUS_LABEL } from "@/lib/order";
import { CATEGORY_ORDER } from "@/lib/services";
import type { OrderStatus, ServiceCategory } from "@prisma/client";

const STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[];

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  CHAUFFEUR: "Şoförlü Araç",
  TRANSFER: "Transfer",
  TOUR: "Turlar",
  GUIDE: "Özel Rehberlik",
  GREETING: "Selamlama",
};

export default async function RaporlarPage() {
  const [statusRows, orderItems, toplamSiparis, ciroRows, toplamTalep] =
    await Promise.all([
      db.order.groupBy({ by: ["durum"], _count: { _all: true } }),
      db.orderItem.findMany({ include: { service: true } }),
      db.order.count(),
      db.order.aggregate({
        _sum: { toplamTutar: true },
        where: { durum: { in: ["ONAYLANDI", "DEVAM_EDIYOR", "TAMAMLANDI"] } },
      }),
      db.lead.count(),
    ]);

  const ciro = ciroRows._sum.toplamTutar ?? 0;

  // (a) Duruma göre sipariş adedi
  const statusCounts = new Map<OrderStatus, number>(
    statusRows.map((r) => [r.durum, r._count._all]),
  );
  const durumData = STATUSES.map((s) => ({
    label: STATUS_LABEL[s],
    value: statusCounts.get(s) ?? 0,
  }));
  const durumMax = Math.max(1, ...durumData.map((d) => d.value));

  // (b) Kategoriye göre talep adedi
  const kategoriCounts = new Map<ServiceCategory, number>();
  for (const item of orderItems) {
    const k = item.service.kategori;
    kategoriCounts.set(k, (kategoriCounts.get(k) ?? 0) + 1);
  }
  const kategoriData = CATEGORY_ORDER.map((k) => ({
    label: CATEGORY_LABEL[k],
    value: kategoriCounts.get(k) ?? 0,
  }));
  const kategoriMax = Math.max(1, ...kategoriData.map((d) => d.value));

  return (
    <>
      <PageHeader
        title="Raporlar"
        desc="Operasyonun özeti ve dağılımları."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Toplam Sipariş" value={toplamSiparis} />
        <StatCard label="Onaylı Ciro" value={formatTRY(ciro)} hint="İptal hariç" />
        <StatCard label="Toplam Talep" value={toplamTalep} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ReportCard title="Duruma Göre Sipariş">
          <BarList data={durumData} max={durumMax} />
        </ReportCard>

        <ReportCard title="Kategoriye Göre Talep">
          <BarList data={kategoriData} max={kategoriMax} />
        </ReportCard>
      </div>
    </>
  );
}

function ReportCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius)] border hairline bg-surface/40 p-6">
      <h2 className="mb-6 font-display text-xl text-cream">{title}</h2>
      {children}
    </section>
  );
}

function BarList({
  data,
  max,
}: {
  data: { label: string; value: number }[];
  max: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-cream/75">{d.label}</span>
            <span className="font-display text-cream tabular-nums">
              {d.value}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-cream/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold/70 to-gold-2"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
