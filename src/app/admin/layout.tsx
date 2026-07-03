import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminLogin } from "./AdminLogin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return <AdminLogin />;

  return (
    <div className="above min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <Sidebar userName={session.user.name ?? "Yönetici"} />
      <main className="min-h-screen bg-ink p-6 md:p-10">{children}</main>
    </div>
  );
}
