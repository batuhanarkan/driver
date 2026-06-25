"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_FLOW, STATUS_LABEL } from "@/lib/order";
import { updateOrderStatus } from "@/app/admin/actions";
import type { OrderStatus } from "@prisma/client";

export function StatusControl({
  orderId,
  durum,
}: {
  orderId: string;
  durum: OrderStatus;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hedefler = ORDER_FLOW[durum];

  function gecis(hedef: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, hedef);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "İşlem başarısız oldu.");
      }
    });
  }

  return (
    <div className="glass rounded-[var(--radius)] p-6">
      <h3 className="font-display text-lg text-cream">Durum Yönetimi</h3>
      <p className="mt-1 text-sm text-cream/50">
        Mevcut durum: {STATUS_LABEL[durum]}
      </p>

      {hedefler.length === 0 ? (
        <p className="mt-5 rounded-xl border hairline bg-ink/40 px-4 py-3 text-sm text-cream/50">
          Bu sipariş kapandı.
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {hedefler.map((hedef) => {
            const iptal = hedef === "IPTAL";
            return (
              <button
                key={hedef}
                onClick={() => gecis(hedef)}
                disabled={pending}
                className={
                  iptal
                    ? "rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-500/20 disabled:opacity-50"
                    : "rounded-xl border border-gold/50 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold transition hover:bg-gold/20 disabled:opacity-50"
                }
              >
                {STATUS_LABEL[hedef]}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
