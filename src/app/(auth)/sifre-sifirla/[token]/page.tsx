import type { Metadata } from "next";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/token";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Şifre Sıfırla" };

export default async function ResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  const valid = record && record.expiresAt > new Date();

  if (!valid) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Bağlantı geçersiz</h1>
        <p className="text-sm text-neutral-400">
          Bu sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir
          bağlantı talep et.
        </p>
        <a
          href="/sifre-sifirla"
          className="block pt-2 text-center text-sm text-amber-400"
        >
          Yeni bağlantı iste
        </a>
      </div>
    );
  }

  return <ResetForm token={token} />;
}
