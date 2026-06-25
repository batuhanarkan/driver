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
  serviceId: string | null;
  serviceBaslik: string | null;
  baslangic: string; // datetime-local ("" = yok)
  bitis: string;
};

type ServiceOpt = { id: string; baslik: string };

const inputCls =
  "w-full rounded-xl border border-line/70 bg-ink-2 px-4 py-3 text-cream outline-none transition focus:border-gold/60";

const emptyForm: CampaignInput = {
  baslik: "",
  aciklama: "",
  indirimYuzde: 0,
  aktif: true,
  serviceId: "",
  baslangic: "",
  bitis: "",
};

function tarihAralik(b: string, e: string): string | null {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  if (b && e) return `${fmt(b)} – ${fmt(e)}`;
  if (b) return `${fmt(b)} sonrası`;
  if (e) return `${fmt(e)} sonuna kadar`;
  return null;
}

export function CampaignManager({
  campaigns,
  services,
}: {
  campaigns: Campaign[];
  services: ServiceOpt[];
}) {
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
      serviceId: c.serviceId ?? "",
      baslangic: c.baslangic,
      bitis: c.bitis,
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
          {campaigns.map((c) => {
            const aralik = tarihAralik(c.baslangic, c.bitis);
            return (
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

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-cream/5 px-3 py-1 text-cream/60">
                    {c.serviceBaslik ? `Hizmet: ${c.serviceBaslik}` : "Genel"}
                  </span>
                  {aralik && (
                    <span className="rounded-full bg-cream/5 px-3 py-1 text-cream/60">
                      {aralik}
                    </span>
                  )}
                </div>

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
                    className="text-sm text-rose-600/80 transition hover:text-rose-700 disabled:opacity-50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <div className="glass relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius)] p-7">
            <h2 className="font-display text-2xl text-cream">
              {form.id ? "Kampanyayı Düzenle" : "Yeni Kampanya"}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-cream/60">Başlık</label>
                <input
                  value={form.baslik}
                  onChange={(e) => setForm({ ...form, baslik: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">Açıklama</label>
                <textarea
                  value={form.aciklama}
                  onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                  rows={3}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">
                  Hangi hizmet için?
                </label>
                <select
                  value={form.serviceId ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, serviceId: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Genel (tüm hizmetler)</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.baslik}
                    </option>
                  ))}
                </select>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-cream/60">
                    Başlangıç
                  </label>
                  <input
                    type="datetime-local"
                    value={form.baslangic ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, baslangic: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-cream/60">Bitiş</label>
                  <input
                    type="datetime-local"
                    value={form.bitis ?? ""}
                    onChange={(e) => setForm({ ...form, bitis: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <p className="text-xs text-cream/40">
                Tarih boş bırakılırsa kampanya süresiz geçerli sayılır.
              </p>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-cream/75">
                <input
                  type="checkbox"
                  checked={form.aktif}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                Yayında (aktif)
              </label>
            </div>

            {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

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
