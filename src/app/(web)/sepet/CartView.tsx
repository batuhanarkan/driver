"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatTRY } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/app/(web)/actions";

export function CartView({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, remove, clear, total } = useCart();
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
    startTransition(async () => {
      const res = await createOrder({
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
        router.push(`/hesabim?siparis=${res.siparisNo}`);
        router.refresh();
      } else if (res.needAuth) {
        router.push("/giris?callbackUrl=/sepet");
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
                <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-cream/55 sm:grid-cols-2">
                  {Object.entries(i.detay).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="text-cream/40">{k}:</dt>
                      <dd className="text-cream/70">{String(v)}</dd>
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
                  className="mt-3 text-xs text-rose-400/80 transition hover:text-rose-300"
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

          <label className="mt-5 block text-sm text-cream/60">Not (opsiyonel)</label>
          <textarea
            value={not}
            onChange={(e) => setNot(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-line/70 bg-ink/60 px-4 py-3 text-sm text-cream outline-none transition focus:border-gold/60"
            placeholder="Eklemek istedikleriniz..."
          />

          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
          {!isLoggedIn && (
            <p className="mt-3 text-xs text-cream/45">
              Siparişi göndermek için giriş yapmanız istenecek.
            </p>
          )}

          <Button
            onClick={submit}
            disabled={pending}
            size="lg"
            className="mt-5 w-full"
          >
            {pending ? "Gönderiliyor..." : "Siparişi Gönder"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
