"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatTRY } from "@/lib/format";
import { detayRows } from "@/lib/order";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/app/(web)/actions";

const inputCls =
  "w-full rounded-xl border border-line/70 bg-ink-2 px-4 py-3 text-sm text-cream outline-none transition focus:border-gold/60";

export function CartView() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, remove, clear, total } = useCart();
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [not, setNot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-40 animate-pulse rounded-[var(--radius)] bg-surface/30" />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border hairline bg-surface/30 p-12 text-center">
        <p className="text-lg text-cream/70">Sepetiniz boş.</p>
        <Button href="/rezervasyon" className="mt-6">
          Hizmet Seç
        </Button>
      </div>
    );
  }

  function submit() {
    setError(null);
    if (ad.trim().length < 2) return setError("Lütfen ad soyad girin.");
    if (!/.+@.+\..+/.test(email)) return setError("Lütfen geçerli bir e-posta girin.");
    if (telefon.trim().length < 10) return setError("Lütfen geçerli bir telefon girin.");

    startTransition(async () => {
      const res = await createOrder({
        musteriAd: ad.trim(),
        musteriEmail: email.trim(),
        musteriTelefon: telefon.trim(),
        items: items.map((i) => ({
          serviceId: i.serviceId,
          vehicleId: i.vehicleId,
          detay: i.detay,
          adet: i.adet,
        })),
        not: not || undefined,
      });
      if (res.ok) {
        clear();
        router.push(`/siparis-alindi?no=${res.siparisNo}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i.id}
            className="rounded-[var(--radius)] border hairline bg-surface/40 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl">{i.serviceTitle}</h3>
                {i.vehicleName && (
                  <p className="mt-1 text-sm text-gold/80">{i.vehicleName}</p>
                )}
                <dl className="mt-3 divide-y divide-line/40 text-sm">
                  {detayRows(i.detay).map((r) => (
                    <div key={r.label} className="flex items-center gap-3 py-2">
                      <dt className="w-24 shrink-0 text-cream/40">{r.label}</dt>
                      <dd className="text-cream/75">{r.value}</dd>
                      {r.mapUrl && (
                        <a
                          href={r.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-gold/40 px-3 py-1 text-xs text-gold transition hover:bg-gold/10"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                            <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" strokeLinejoin="round" />
                            <circle cx="12" cy="10" r="2.4" />
                          </svg>
                          Konumu göster
                        </a>
                      )}
                    </div>
                  ))}
                </dl>
              </div>
              <div className="text-right">
                <p className="text-gold">{formatTRY(i.birimFiyat * i.adet)}</p>
                {i.adet > 1 && (
                  <p className="text-xs text-cream/40">
                    {formatTRY(i.birimFiyat)} × {i.adet}
                  </p>
                )}
                <button
                  onClick={() => remove(i.id)}
                  className="mt-3 text-xs text-rose-600/80 transition hover:text-rose-700"
                >
                  Kaldır
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="glass rounded-[var(--radius)] p-7">
          <h3 className="text-xl">Sipariş Özeti</h3>
          <div className="mt-5 flex items-center justify-between border-b hairline pb-5">
            <span className="text-cream/60">Toplam</span>
            <span className="font-display text-3xl text-gold">
              {formatTRY(total())}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-cream/60">İletişim bilgileriniz</p>
            <input
              className={inputCls}
              placeholder="Ad Soyad"
              value={ad}
              onChange={(e) => setAd(e.target.value)}
            />
            <input
              className={inputCls}
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={inputCls}
              type="tel"
              placeholder="Telefon (05xx...)"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
          </div>

          <label className="mt-5 block text-sm text-cream/60">Not (opsiyonel)</label>
          <textarea
            value={not}
            onChange={(e) => setNot(e.target.value)}
            rows={3}
            className={`${inputCls} mt-2`}
            placeholder="Eklemek istedikleriniz..."
          />

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <Button
            onClick={submit}
            disabled={pending}
            size="lg"
            className="mt-5 w-full"
          >
            {pending ? "Gönderiliyor..." : "Talebi Gönder"}
          </Button>
          <p className="mt-3 text-center text-xs text-cream/40">
            Ödeme alınmaz — ekibimiz sizinle iletişime geçer.
          </p>
        </div>
      </aside>
    </div>
  );
}
