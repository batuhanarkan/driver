import Link from "next/link";
import { db } from "@/lib/db";
import { formatTRY, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageHeader } from "@/components/admin/PageHeader";
import { STATUS_LABEL } from "@/lib/order";
import type { OrderStatus } from "@prisma/client";

const STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[];

export default async function SiparislerPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>;
}) {
  const { durum: raw } = await searchParams;
  const durum = STATUSES.includes(raw as OrderStatus)
    ? (raw as OrderStatus)
    : undefined;

  const siparisler = await db.order.findMany({
    where: durum ? { durum } : undefined,
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Siparişler" desc="Gelen tüm talepler." />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip href="/admin/siparisler" active={!durum}>
          Tümü
        </FilterChip>
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/admin/siparisler?durum=${s}`}
            active={durum === s}
          >
            {STATUS_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      {siparisler.length === 0 ? (
        <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-12 text-center text-cream/50">
          {durum
            ? `${STATUS_LABEL[durum]} durumunda sipariş bulunmuyor.`
            : "Henüz sipariş yok."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius)] border hairline">
          <table className="w-full text-sm">
            <thead className="bg-ink-2/60 text-left text-cream/50">
              <tr>
                <th className="px-5 py-3 font-medium">Sipariş No</th>
                <th className="px-5 py-3 font-medium">Müşteri</th>
                <th className="px-5 py-3 font-medium">Kalem</th>
                <th className="px-5 py-3 font-medium">Tutar</th>
                <th className="px-5 py-3 font-medium">Tarih</th>
                <th className="px-5 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {siparisler.map((o) => (
                <tr
                  key={o.id}
                  className="border-t hairline transition hover:bg-cream/[0.03]"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/siparisler/${o.id}`}
                      className="text-gold/90 transition hover:text-gold"
                    >
                      {o.siparisNo}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-cream/75">{o.user.ad}</td>
                  <td className="px-5 py-3 text-cream/55">
                    {o.items.length} kalem
                  </td>
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
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full border border-gold bg-gold px-4 py-1.5 text-sm font-medium text-ink"
          : "rounded-full border hairline px-4 py-1.5 text-sm text-cream/60 transition hover:border-gold/40 hover:text-cream"
      }
    >
      {children}
    </Link>
  );
}
