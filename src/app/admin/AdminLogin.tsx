"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-cream outline-none transition focus:border-gold/60";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      sifre: fd.get("sifre"),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("E-posta veya şifre hatalı.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="above flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold">
            V
          </span>
          <span className="font-display text-xl">
            Vip<span className="gold-text">Drive</span>
            <span className="ml-1 text-xs text-cream/40">yönetim</span>
          </span>
        </div>

        <div className="glass rounded-[var(--radius)] p-8">
          <h1 className="font-display text-2xl text-cream">Yönetici Girişi</h1>
          <p className="mt-1 text-sm text-cream/55">
            Panele erişmek için giriş yapın.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div>
              <label className="mb-1.5 block text-sm text-cream/60">E-posta</label>
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="admin@vipdrive.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-cream/60">Şifre</label>
              <input
                name="sifre"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <button
              disabled={pending}
              className="w-full rounded-xl bg-gold px-4 py-3 font-semibold text-black transition hover:brightness-105 disabled:opacity-50"
            >
              {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>

        <a
          href="/"
          className="mt-6 block text-center text-sm text-cream/50 transition hover:text-gold"
        >
          ← Siteye dön
        </a>
      </div>
    </div>
  );
}
