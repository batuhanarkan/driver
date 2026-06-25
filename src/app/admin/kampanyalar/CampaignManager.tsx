"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import {
  saveCampaign,
  toggleCampaign,
  deleteCampaign,
} from "@/app/admin/actions";
import type { CampaignInput } from "@/app/admin/actions";

type Campaign = {
  id: string;
  baslik: string;
  aciklama: string;
  indirimYuzde: number;
  aktif: boolean;
};

const inputCls =
  "w-full rounded-xl border border-line/70 bg-ink/60 px-4 py-3 text-cream outline-none transition focus:border-gold/60";

const emptyForm: CampaignInput = {
  baslik: "",
  aciklama: "",
  indirimYuzde: 0,
  aktif: true,
};

export function CampaignManager({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CampaignInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function openEdit(c: Campaign) {
    setForm({
      id: c.id,
      baslik: c.baslik,
      aciklama: c.aciklama,
      indirimYuzde: c.indirimYuzde,
      aktif: c.aktif,
    });
    setError(null);
    setOpen(true);
  }

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveCampaign(form);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Kampanya kaydedilemedi.");
      }
    });
  }

  function toggle(c: Campaign) {
    startTransition(async () => {
      await toggleCampaign(c.id, !c.aktif);
      router.refresh();
    });
  }

  function remove(c: Campaign) {
    startTransition(async () => {
      await deleteCampaign(c.id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={openNew}>+ Yeni Kampanya</Button>
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-8 text-center text-cream/50">
          Henüz kampanya eklenmedi.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="flex flex-col rounded-[var(--radius)] border hairline bg-surface/40 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl text-cream">{c.baslik}</h3>
                <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                  %{c.indirimYuzde}
                </span>
              </div>

              {c.aciklama && (
                <p className="mt-3 text-sm leading-relaxed text-cream/60">
                  {c.aciklama}
                </p>
              )}

              <div className="mt-6 flex items-center gap-3 border-t hairline pt-4">
                <button
                  onClick={() => toggle(c)}
                  disabled={pending}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50",
                    c.aktif
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-line/70 text-cream/50 hover:text-cream",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      c.aktif ? "bg-gold" : "bg-cream/40",
                    )}
                  />
                  {c.aktif ? "Aktif" : "Pasif"}
                </button>

                <button
                  onClick={() => openEdit(c)}
                  className="ml-auto text-sm text-gold/80 transition hover:text-gold"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => remove(c)}
                  disabled={pending}
                  className="text-sm text-rose-400/80 transition hover:text-rose-300 disabled:opacity-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <div className="glass relative z-10 w-full max-w-lg rounded-[var(--radius)] p-7">
            <h2 className="font-display text-2xl text-cream">
              {form.id ? "Kampanyayı Düzenle" : "Yeni Kampanya"}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-cream/60">
                  Başlık
                </label>
                <input
                  value={form.baslik}
                  onChange={(e) =>
                    setForm({ ...form, baslik: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">
                  Açıklama
                </label>
                <textarea
                  value={form.aciklama}
                  onChange={(e) =>
                    setForm({ ...form, aciklama: e.target.value })
                  }
                  rows={3}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">
                  İndirim Yüzdesi (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.indirimYuzde}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      indirimYuzde:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                  className={inputCls}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-cream/75">
                <input
                  type="checkbox"
                  checked={form.aktif}
                  onChange={(e) =>
                    setForm({ ...form, aktif: e.target.checked })
                  }
                  className="h-4 w-4 accent-gold"
                />
                Yayında (aktif)
              </label>
            </div>

            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

            <div className="mt-7 flex justify-end gap-3">
              <Button variant="ghost" onClick={close} disabled={pending}>
                İptal
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
