import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { UserManager } from "./UserManager";

export default async function KullanicilarPage() {
  const session = await auth();

  const kullanicilar = await db.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  const toplam = kullanicilar.length;
  const adminSayisi = kullanicilar.filter((u) => u.rol === "ADMIN").length;

  const users = kullanicilar.map((u) => ({
    id: u.id,
    ad: u.ad,
    email: u.email,
    telefon: u.telefon ?? null,
    rol: u.rol as "USER" | "ADMIN",
    createdAt: u.createdAt.toISOString(),
    siparisSayisi: u._count.orders,
  }));

  return (
    <>
      <PageHeader title="Kullanıcılar" desc="Kayıtlı müşteriler ve yöneticiler." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Toplam Kullanıcı" value={toplam} />
        <StatCard label="Yönetici" value={adminSayisi} hint="ADMIN rolündeki hesaplar" />
      </div>

      <div className="mt-10">
        <UserManager users={users} currentUserId={session!.user.id} />
      </div>
    </>
  );
}
