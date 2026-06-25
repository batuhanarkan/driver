"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { formatTRY } from "@/lib/format";
import { saveVehicle, toggleVehicle, deleteVehicle } from "@/app/admin/actions";
import type { VehicleInput } from "@/app/admin/actions";

type Vehicle = {
  id: string;
  ad: string;
  sinif: "EKONOMI" | "BUSINESS" | "VAN" | "LUKS";
  kapasite: number;
  fiyat: number;
  aktif: boolean;
};

const SINIF_LABEL: Record<Vehicle["sinif"], string> = {
  EKONOMI: "Ekonomi",
  BUSINESS: "Business",
  VAN: "VAN",
  LUKS: "Lüks",
};

const SINIF_VALUES: Vehicle["sinif"][] = ["EKONOMI", "BUSINESS", "VAN", "LUKS"];

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-cream outline-none transition focus:border-gold/60";

const emptyForm: VehicleInput = {
  ad: "",
  sinif: "EKONOMI",
  kapasite: 1,
  fiyat: 0,
  aktif: true,
};

export function VehicleManager({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VehicleInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function openNew() {
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function openEdit(v: Vehicle) {
    setForm({
      id: v.id,
      ad: v.ad,
      sinif: v.sinif,
      kapasite: v.kapasite,
      fiyat: v.fiyat,
      aktif: v.aktif,
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
      const res = await saveVehicle(form);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Araç kaydedilemedi.");
      }
    });
  }

  function toggle(v: Vehicle) {
    setRowError(null);
    startTransition(async () => {
      await toggleVehicle(v.id, !v.aktif);
      router.refresh();
    });
  }

  function remove(v: Vehicle) {
    setRowError(null);
    startTransition(async () => {
      const res = await deleteVehicle(v.id);
      if (!res.ok) {
        setRowError(res.error ?? "Araç silinemedi.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={openNew}>+ Yeni Araç</Button>
      </div>

      {rowError && (
        <p className="mb-5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {rowError}
        </p>
      )}

      {vehicles.length === 0 ? (
        <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-12 text-center text-cream/50">
          Henüz araç eklenmedi.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius)] border hairline">
          <table className="w-full text-sm">
            <thead className="bg-ink-2/60 text-left text-cream/50">
              <tr>
                <th className="px-5 py-3 font-medium">Ad</th>
                <th className="px-5 py-3 font-medium">Sınıf</th>
                <th className="px-5 py-3 font-medium">Kapasite</th>
                <th className="px-5 py-3 font-medium">Fiyat</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 text-right font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr
                  key={v.id}
                  className="border-t hairline transition hover:bg-cream/[0.03]"
                >
                  <td className="px-5 py-3 text-cream/85">{v.ad}</td>
                  <td className="px-5 py-3 text-cream/65">
                    {SINIF_LABEL[v.sinif]}
                  </td>
                  <td className="px-5 py-3 text-cream/65">{v.kapasite} kişi</td>
                  <td className="px-5 py-3 text-cream/85">{formatTRY(v.fiyat)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggle(v)}
                      disabled={pending}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50",
                        v.aktif
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-line/70 text-cream/50 hover:text-cream",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          v.aktif ? "bg-gold" : "bg-cream/40",
                        )}
                      />
                      {v.aktif ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(v)}
                        className="text-sm text-gold/80 transition hover:text-gold"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => remove(v)}
                        disabled={pending}
                        className="text-sm text-rose-600/80 transition hover:text-rose-700 disabled:opacity-50"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              {form.id ? "Aracı Düzenle" : "Yeni Araç"}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-cream/60">Ad</label>
                <input
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">Sınıf</label>
                <select
                  value={form.sinif}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sinif: e.target.value as Vehicle["sinif"],
                    })
                  }
                  className={inputCls}
                >
                  {SINIF_VALUES.map((s) => (
                    <option key={s} value={s}>
                      {SINIF_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-cream/60">
                    Kapasite (kişi)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.kapasite}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        kapasite:
                          e.target.value === "" ? 1 : Number(e.target.value),
                      })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-cream/60">
                    Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.fiyat}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fiyat:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-cream/75">
                <input
                  type="checkbox"
                  checked={form.aktif}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                Aktif (rezervasyonda görünsün)
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
