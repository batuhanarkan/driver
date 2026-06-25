"use server";

import { registerSchema } from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

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
