"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ kayitBasarili }: { kayitBasarili: boolean }) {
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
      setError("E-posta veya şifre hatalı");
      return;
    }
    router.push("/hesabim");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Giriş Yap</h1>
      {kayitBasarili && (
        <p className="text-green-400 text-sm">Kayıt başarılı, giriş yapabilirsin.</p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <input name="email" type="email" placeholder="E-posta" className="w-full rounded bg-neutral-900 p-3" />
      <input name="sifre" type="password" placeholder="Şifre" className="w-full rounded bg-neutral-900 p-3" />
      <button
        disabled={pending}
        className="w-full rounded bg-amber-500 p-3 font-medium text-black disabled:opacity-50"
      >
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
      <a href="/kayit" className="block text-center text-sm text-neutral-400">
        Hesabın yok mu? Kayıt ol
      </a>
    </form>
  );
}
