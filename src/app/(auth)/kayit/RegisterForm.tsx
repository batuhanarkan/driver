"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser, type ActionState } from "../actions";

const initial: ActionState = { ok: false };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerUser, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/giris?kayit=basarili");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-4">
      <h1 className="text-2xl font-semibold">Kayıt Ol</h1>
      {state.error && <p className="text-rose-600 text-sm">{state.error}</p>}
      <input name="ad" placeholder="Ad Soyad" className="w-full rounded border border-line bg-white p-3" />
      <input name="email" type="email" placeholder="E-posta" className="w-full rounded border border-line bg-white p-3" />
      <input name="telefon" placeholder="Telefon" className="w-full rounded border border-line bg-white p-3" />
      <input name="sifre" type="password" placeholder="Şifre" className="w-full rounded border border-line bg-white p-3" />
      <button
        disabled={pending}
        className="w-full rounded bg-gold p-3 font-medium text-black disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kayıt Ol"}
      </button>
      <a href="/giris" className="block text-center text-sm text-muted">
        Zaten hesabın var mı? Giriş yap
      </a>
    </form>
  );
}
