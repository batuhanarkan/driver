"use server";

import {
  registerSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createResetToken, hashToken } from "@/lib/token";
import { sendMail } from "@/lib/mail";

export type ActionState = { ok: boolean; error?: string };

export async function registerUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    ad: formData.get("ad"),
    email: formData.get("email"),
    telefon: formData.get("telefon"),
    sifre: formData.get("sifre"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) return { ok: false, error: "Bu e-posta zaten kayıtlı" };

  await db.user.create({
    data: {
      ad: parsed.data.ad,
      email: parsed.data.email,
      telefon: parsed.data.telefon,
      sifreHash: await hashPassword(parsed.data.sifre),
      rol: "USER",
    },
  });
  return { ok: true };
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    // Önceki token'ları geçersiz kıl, yenisini üret
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const { token, tokenHash } = createResetToken();
    await db.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const base = process.env.APP_URL ?? "http://localhost:3100";
    const link = `${base}/sifre-sifirla/${token}`;
    await sendMail({
      to: user.email,
      subject: "VipDrive — Şifre sıfırlama",
      text: `Merhaba ${user.ad},\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n${link}\n\nBu bağlantı 1 saat geçerlidir. Bu talebi siz yapmadıysanız e-postayı yok sayabilirsiniz.`,
    });
  }

  // E-posta sızdırma koruması: kayıt olsun olmasın aynı yanıt.
  return { ok: true };
}

export async function resetPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  if (!token) return { ok: false, error: "Geçersiz bağlantı." };

  const parsed = resetPasswordSchema.safeParse({ sifre: formData.get("sifre") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.expiresAt < new Date()) {
    return { ok: false, error: "Bağlantı geçersiz veya süresi dolmuş." };
  }

  await db.user.update({
    where: { id: record.userId },
    data: { sifreHash: await hashPassword(parsed.data.sifre) },
  });
  // Tek kullanımlık: kullanıcının tüm reset token'larını sil
  await db.passwordResetToken.deleteMany({ where: { userId: record.userId } });

  return { ok: true };
}
