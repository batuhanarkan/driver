import Link from "next/link";
import { db } from "@/lib/db";
import { formatTRY, formatDate } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminDashboard() {
  const [
    toplamSiparis,
    bekleyen,
    toplamKullanici,
    yeniTalep,
    ciroRows,
    sonSiparisler,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { durum: "BEKLEMEDE" } }),
    db.user.count({ where: { rol: "USER" } }),
    db.lead.count(),
    db.order.aggregate({
      _sum: { toplamTutar: true },
      where: { durum: { in: ["ONAYLANDI", "DEVAM_EDIYOR", "TAMAMLANDI"] } },
    }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: true, items: true },
    }),
  ]);

  const ciro = ciroRows._sum.toplamTutar ?? 0;

  return (
    <>
      <PageHeader
        title="Genel Bakış"
        desc="VipDrive operasyonunun anlık durumu."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Sipariş" value={toplamSiparis} />
        <StatCard label="Bekleyen Sipariş" value={bekleyen} hint="İşlem bekliyor" />
        <StatCard label="Kayıtlı Kullanıcı" value={toplamKullanici} />
        <StatCard label="Onaylı Ciro" value={formatTRY(ciro)} hint="İptal hariç" />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">Son Siparişler</h2>
          <Link
            href="/admin/siparisler"
            className="text-sm text-gold/80 transition hover:text-gold"
          >
            Tümünü gör →
          </Link>
        </div>

        {sonSiparisler.length === 0 ? (
          <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-8 text-center text-cream/50">
            Henüz sipariş yok.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius)] border hairline">
            <table className="w-full text-sm">
              <thead className="bg-ink-2/60 text-left text-cream/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Sipariş</th>
                  <th className="px-5 py-3 font-medium">Müşteri</th>
                  <th className="px-5 py-3 font-medium">Tutar</th>
                  <th className="px-5 py-3 font-medium">Tarih</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {sonSiparisler.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t hairline transition hover:bg-cream/[0.03]"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/siparisler/${o.id}`}
                        className="text-gold/90 hover:text-gold"
                      >
                        {o.siparisNo}
                      </Link>
                      <span className="ml-2 text-cream/40">
                        {o.items.length} kalem
                      </span>
                    </td>
                    <td className="px-5 py-3 text-cream/75">{o.user.ad}</td>
                    <td className="px-5 py-3 text-cream/75">
                      {formatTRY(o.toplamTutar)}
                    </td>
                    <td className="px-5 py-3 text-cream/55">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge durum={o.durum} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
