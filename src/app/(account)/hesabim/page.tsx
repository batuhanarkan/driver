import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatTRY, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SignOutButton } from "./SignOutButton";

export default async function HesabimPage({
  searchParams,
}: {
  searchParams: Promise<{ siparis?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const { siparis } = await searchParams;

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });

  const isAdmin = session.user.role === "ADMIN";

  return (
    <main className="container-px mx-auto max-w-5xl py-16">
      {siparis && (
        <div className="animate-rise mb-10 rounded-[var(--radius)] border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300">
          <p className="text-sm leading-relaxed">
            Siparişiniz alındı! Sipariş No:{" "}
            <span className="font-medium">{siparis}</span>. Ekibimiz en kısa
            sürede sizinle iletişime geçecek.
          </p>
        </div>
      )}

      {/* Profil özeti */}
      <section className="glass rounded-[var(--radius)] p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold/70">
              Hesabım
            </p>
            <h1 className="mt-3 text-3xl gold-text">{session.user.name}</h1>
            <dl className="mt-4 space-y-1 text-sm text-cream/60">
              <div className="flex gap-2">
                <dt className="text-cream/40">E-posta:</dt>
                <dd>{session.user.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-cream/40">Rol:</dt>
                <dd>{isAdmin ? "Yönetici" : "Üye"}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Button href="/admin" variant="outline">
                Yönetim Paneli
              </Button>
            )}
            <SignOutButton />
          </div>
        </div>
      </section>

      {/* Siparişler */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">Siparişlerim</h2>
          {orders.length > 0 && (
            <span className="text-sm text-cream/40">
              {orders.length} talep
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-[var(--radius)] border hairline bg-surface/30 p-12 text-center">
            <p className="text-lg text-cream/70">Henüz bir talebiniz yok.</p>
            <p className="mt-2 text-sm text-cream/45">
              İhtiyacınıza uygun ayrıcalıklı ulaşım deneyimini birkaç adımda
              planlayın.
            </p>
            <Button href="/rezervasyon" className="mt-6">
              İlk talebini oluştur
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[var(--radius)] border hairline bg-surface/40 p-6"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b hairline pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-lg tracking-wide text-cream">
                      {order.siparisNo}
                    </span>
                    <StatusBadge durum={order.durum} />
                  </div>
                  <div className="text-right">
                    <p className="text-gold">{formatTRY(order.toplamTutar)}</p>
                    <p className="text-xs text-cream/40">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </header>

                <ul className="mt-4 space-y-4">
                  {order.items.map((item) => {
                    const detay =
                      (item.detay as Record<string, string | number> | null) ??
                      {};
                    return (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <div>
                          <h3 className="text-base text-cream">
                            {item.service.baslik}
                          </h3>
                          <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                            {Object.entries(detay).map(([k, v]) => (
                              <div key={k} className="flex gap-2">
                                <dt className="text-cream/40">{k}:</dt>
                                <dd className="text-cream/70">{String(v)}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-cream/80">
                            {formatTRY(item.birimFiyat * item.adet)}
                          </p>
                          {item.adet > 1 && (
                            <p className="text-xs text-cream/40">
                              {formatTRY(item.birimFiyat)} × {item.adet}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {order.not && (
                  <p className="mt-4 border-t hairline pt-4 text-sm text-cream/55">
                    <span className="text-cream/40">Not: </span>
                    {order.not}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
