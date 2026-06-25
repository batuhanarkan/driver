"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetPassword, type ActionState } from "../../actions";

const initial: ActionState = { ok: false };

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/giris?sifirlandi=1");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-4">
      <h1 className="text-2xl font-semibold">Yeni şifre belirle</h1>
      <p className="text-sm text-neutral-400">
        Hesabın için yeni bir şifre gir.
      </p>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <input type="hidden" name="token" value={token} />
      <input
        name="sifre"
        type="password"
        placeholder="Yeni şifre (en az 6 karakter)"
        className="w-full rounded bg-neutral-900 p-3"
      />
      <button
        disabled={pending}
        className="w-full rounded bg-amber-500 p-3 font-medium text-black disabled:opacity-50"
      >
        {pending ? "Güncelleniyor..." : "Şifreyi güncelle"}
      </button>
    </form>
  );
}
