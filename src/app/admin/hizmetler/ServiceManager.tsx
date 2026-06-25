"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatTRY } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { saveService, toggleService } from "@/app/admin/actions";
import type { ServiceInput } from "@/app/admin/actions";
import type { ServiceCategory } from "@prisma/client";

type Service = {
  id: string;
  slug: string;
  kategori: ServiceCategory;
  baslik: string;
  aciklama: string;
  temelFiyat: number;
  aktif: boolean;
};

const KATEGORILER: { value: ServiceCategory; label: string }[] = [
  { value: "CHAUFFEUR", label: "Şoförlü Araç" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "TOUR", label: "Turlar" },
  { value: "GUIDE", label: "Özel Rehberlik" },
  { value: "GREETING", label: "Selamlama" },
];

const KATEGORI_LABEL = Object.fromEntries(
  KATEGORILER.map((k) => [k.value, k.label]),
) as Record<ServiceCategory, string>;

const inputCls =
  "w-full rounded-xl border border-line/70 bg-ink-2 px-4 py-3 text-cream outline-none transition focus:border-gold/60";

const emptyForm: ServiceInput = {
  slug: "",
  kategori: "CHAUFFEUR",
  baslik: "",
  aciklama: "",
  temelFiyat: 0,
  aktif: true,
};

export function ServiceManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ServiceInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function openEdit(s: Service) {
    setForm({
      id: s.id,
      slug: s.slug,
      kategori: s.kategori,
      baslik: s.baslik,
      aciklama: s.aciklama,
      temelFiyat: s.temelFiyat,
      aktif: s.aktif,
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
      const res = await saveService(form);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Hizmet kaydedilemedi.");
      }
    });
  }

  function toggle(s: Service) {
    startTransition(async () => {
      await toggleService(s.id, !s.aktif);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={openNew}>+ Yeni Hizmet</Button>
      </div>

      {services.length === 0 ? (
        <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-8 text-center text-cream/50">
          Henüz hizmet eklenmedi.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius)] border hairline">
          <table className="w-full text-sm">
            <thead className="bg-ink-2/60 text-left text-cream/50">
              <tr>
                <th className="px-5 py-3 font-medium">Hizmet</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium">Temel Fiyat</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr
                  key={s.id}
                  className="border-t hairline transition hover:bg-cream/[0.03]"
                >
                  <td className="px-5 py-4">
                    <div className="text-cream">{s.baslik}</div>
                    <div className="mt-0.5 text-xs text-cream/40">{s.slug}</div>
                  </td>
                  <td className="px-5 py-4 text-cream/75">
                    {KATEGORI_LABEL[s.kategori]}
                  </td>
                  <td className="px-5 py-4 text-gold/90">
                    {formatTRY(s.temelFiyat)}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggle(s)}
                      disabled={pending}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50",
                        s.aktif
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-line/70 text-cream/50 hover:text-cream",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          s.aktif ? "bg-gold" : "bg-cream/40",
                        )}
                      />
                      {s.aktif ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-sm text-gold/80 transition hover:text-gold"
                    >
                      Düzenle
                    </button>
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
          <div className="glass relative z-10 w-full max-w-lg rounded-[var(--radius)] p-7">
            <h2 className="font-display text-2xl text-cream">
              {form.id ? "Hizmeti Düzenle" : "Yeni Hizmet"}
            </h2>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-cream/60">
                    Slug
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value })
                    }
                    placeholder="ornek-hizmet"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-cream/60">
                    Kategori
                  </label>
                  <select
                    value={form.kategori}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        kategori: e.target.value as ServiceCategory,
                      })
                    }
                    className={inputCls}
                  >
                    {KATEGORILER.map((k) => (
                      <option key={k.value} value={k.value} className="bg-ink">
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                  Temel Fiyat (₺)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.temelFiyat}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      temelFiyat:
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
