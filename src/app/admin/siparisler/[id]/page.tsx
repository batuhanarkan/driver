import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatTRY, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusControl } from "@/app/admin/siparisler/StatusControl";

export default async function SiparisDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { service: true, vehicle: true } },
    },
  });

  if (!order) notFound();

  return (
    <>
      <Link
        href="/admin/siparisler"
        className="text-sm text-cream/50 transition hover:text-gold"
      >
        ← Siparişler
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-3xl text-cream">{order.siparisNo}</h1>
        <StatusBadge durum={order.durum} />
        <span className="text-sm text-cream/45">
          {formatDate(order.createdAt)}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-8">
          {/* Müşteri kartı */}
          <div className="rounded-[var(--radius)] border hairline bg-surface/40 p-6">
            <h2 className="font-display text-lg text-cream">Müşteri</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-cream/40">Ad Soyad</dt>
                <dd className="mt-1 text-cream/85">{order.user.ad}</dd>
              </div>
              <div>
                <dt className="text-cream/40">E-posta</dt>
                <dd className="mt-1 text-cream/85">{order.user.email}</dd>
              </div>
              <div>
                <dt className="text-cream/40">Telefon</dt>
                <dd className="mt-1 text-cream/85">
                  {order.user.telefon ?? "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Kalemler */}
          <div>
            <h2 className="mb-4 font-display text-lg text-cream">Kalemler</h2>
            <div className="space-y-4">
              {order.items.map((item) => {
                const detay = (item.detay ?? {}) as Record<
                  string,
                  string | number
                >;
                return (
                  <div
                    key={item.id}
                    className="rounded-[var(--radius)] border hairline bg-surface/40 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl">{item.service.baslik}</h3>
                        {item.vehicle?.ad && (
                          <p className="mt-1 text-sm text-gold/80">
                            {item.vehicle.ad}
                          </p>
                        )}
                        {Object.keys(detay).length > 0 && (
                          <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                            {Object.entries(detay).map(([k, v]) => (
                              <div key={k} className="flex gap-2">
                                <dt className="text-cream/40">{k}:</dt>
                                <dd className="text-cream/70">{String(v)}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gold">
                          {formatTRY(item.birimFiyat * item.adet)}
                        </p>
                        {item.adet > 1 && (
                          <p className="text-xs text-cream/40">
                            {formatTRY(item.birimFiyat)} × {item.adet}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toplam */}
            <div className="mt-4 flex items-center justify-between rounded-[var(--radius)] border hairline bg-ink-2/50 px-6 py-5">
              <span className="text-cream/60">Toplam</span>
              <span className="font-display text-2xl text-gold">
                {formatTRY(order.toplamTutar)}
              </span>
            </div>

            {/* Not */}
            {order.not && (
              <div className="mt-6 rounded-[var(--radius)] border hairline bg-surface/30 p-6">
                <h3 className="text-sm text-cream/40">Müşteri Notu</h3>
                <p className="mt-2 text-sm text-cream/80">{order.not}</p>
              </div>
            )}
          </div>
        </div>

        {/* Durum kontrolü */}
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <StatusControl orderId={order.id} durum={order.durum} />
        </aside>
      </div>
    </>
  );
}
