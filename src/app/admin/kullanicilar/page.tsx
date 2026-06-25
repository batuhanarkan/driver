import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";

export default async function KullanicilarPage() {
  const kullanicilar = await db.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  const toplam = kullanicilar.length;
  const adminSayisi = kullanicilar.filter((u) => u.rol === "ADMIN").length;

  return (
    <>
      <PageHeader title="Kullanıcılar" desc="Kayıtlı müşteriler ve yöneticiler." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Toplam Kullanıcı" value={toplam} />
        <StatCard label="Yönetici" value={adminSayisi} hint="ADMIN rolündeki hesaplar" />
      </div>

      <div className="mt-10">
        {kullanicilar.length === 0 ? (
          <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-12 text-center text-cream/50">
            Henüz kullanıcı yok.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius)] border hairline">
            <table className="w-full text-sm">
              <thead className="bg-ink-2/60 text-left text-cream/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Ad</th>
                  <th className="px-5 py-3 font-medium">E-posta</th>
                  <th className="px-5 py-3 font-medium">Telefon</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Sipariş</th>
                  <th className="px-5 py-3 font-medium">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {kullanicilar.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t hairline transition hover:bg-cream/[0.03]"
                  >
                    <td className="px-5 py-3 text-cream/85">{u.ad}</td>
                    <td className="px-5 py-3 text-cream/65">{u.email}</td>
                    <td className="px-5 py-3 text-cream/65">
                      {u.telefon ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <RoleBadge rol={u.rol} />
                    </td>
                    <td className="px-5 py-3 text-cream/75">{u._count.orders}</td>
                    <td className="px-5 py-3 text-cream/55">
                      {formatDate(u.createdAt)}
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

function RoleBadge({ rol }: { rol: "USER" | "ADMIN" }) {
  return rol === "ADMIN" ? (
    <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-xs font-medium text-gold-2">
      Yönetici
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border hairline bg-cream/5 px-3 py-1 text-xs font-medium text-cream/60">
      Üye
    </span>
  );
}
