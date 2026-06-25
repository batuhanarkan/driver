"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ActionState } from "../actions";

const initial: ActionState = { ok: false };

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initial,
  );

  if (state.ok) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">E-postanı kontrol et</h1>
        <p className="text-sm text-neutral-400">
          Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı
          gönderildi. Bağlantı 1 saat geçerlidir.
        </p>
        <a href="/giris" className="block pt-2 text-center text-sm text-neutral-400">
          ← Girişe dön
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <h1 className="text-2xl font-semibold">Şifremi unuttum</h1>
      <p className="text-sm text-neutral-400">
        Hesabının e-posta adresini gir, sana bir sıfırlama bağlantısı gönderelim.
      </p>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <input
        name="email"
        type="email"
        placeholder="E-posta"
        className="w-full rounded bg-neutral-900 p-3"
      />
      <button
        disabled={pending}
        className="w-full rounded bg-amber-500 p-3 font-medium text-black disabled:opacity-50"
      >
        {pending ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
      </button>
      <a href="/giris" className="block text-center text-sm text-neutral-400">
        ← Girişe dön
      </a>
    </form>
  );
}
