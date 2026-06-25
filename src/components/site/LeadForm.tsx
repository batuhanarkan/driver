"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { createLead } from "@/app/(web)/actions";

type Props = {
  tip: "ILETISIM" | "KURUMSAL" | "KARIYER";
  mesajLabel?: string;
  mesajPlaceholder?: string;
  submitLabel?: string;
};

const inputCls =
  "w-full rounded-xl border border-line/70 bg-ink-2 px-4 py-3 text-cream outline-none transition focus:border-gold/60";

export function LeadForm({
  tip,
  mesajLabel = "Mesajınız",
  mesajPlaceholder = "Bize iletmek istedikleriniz...",
  submitLabel = "Gönder",
}: Props) {
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createLead({
        tip,
        ad,
        email,
        telefon: telefon || undefined,
        mesaj,
      });
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error ?? "Bir şeyler ters gitti, lütfen tekrar deneyin.");
      }
    });
  }

  if (done) {
    return (
      <div className="glass rounded-[var(--radius)] p-10 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-2xl text-gold">
          ✓
        </span>
        <h3 className="mt-6 text-2xl">Talebiniz alındı</h3>
        <p className="mt-3 text-sm leading-relaxed text-cream/60">
          Talebiniz alındı, en kısa sürede dönüş yapacağız.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-[var(--radius)] p-7 md:p-8">
      <div className="grid gap-5">
        <div>
          <label htmlFor="lead-ad" className="block text-sm text-cream/60">
            Ad Soyad
          </label>
          <input
            id="lead-ad"
            type="text"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            required
            className={`mt-2 ${inputCls}`}
            placeholder="Adınız ve soyadınız"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-email" className="block text-sm text-cream/60">
              E-posta
            </label>
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`mt-2 ${inputCls}`}
              placeholder="ornek@eposta.com"
            />
          </div>
          <div>
            <label htmlFor="lead-telefon" className="block text-sm text-cream/60">
              Telefon{" "}
              <span className="text-cream/35">(opsiyonel)</span>
            </label>
            <input
              id="lead-telefon"
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              className={`mt-2 ${inputCls}`}
              placeholder="+90 5xx xxx xx xx"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lead-mesaj" className="block text-sm text-cream/60">
            {mesajLabel}
          </label>
          <textarea
            id="lead-mesaj"
            value={mesaj}
            onChange={(e) => setMesaj(e.target.value)}
            required
            rows={5}
            className={`mt-2 ${inputCls}`}
            placeholder={mesajPlaceholder}
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Gönderiliyor..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
