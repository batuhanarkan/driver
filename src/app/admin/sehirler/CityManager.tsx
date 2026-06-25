"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { getCitiesForAdmin } from "@/lib/cities";
import {
  saveCity,
  toggleCity,
  deleteCity,
  saveLocation,
  deleteLocation,
} from "@/app/admin/actions";
import type { CityInput, LocationInput } from "@/app/admin/actions";

type City = Awaited<ReturnType<typeof getCitiesForAdmin>>[number];
type ServiceOpt = { id: string; baslik: string };
type LocationTip = LocationInput["tip"];

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-cream outline-none transition focus:border-gold/60";

const TIP_ETIKET: Record<LocationTip, string> = {
  HAVALIMANI: "Havalimanı",
  OTEL: "Otel",
  SEMT: "Semt",
  DIGER: "Diğer",
};

const TIP_LISTE: LocationTip[] = ["HAVALIMANI", "OTEL", "SEMT", "DIGER"];

const emptyForm: CityInput = {
  ad: "",
  slug: "",
  aktif: true,
  siralama: 0,
  serviceIds: [],
};

export function CityManager({
  cities,
  services,
}: {
  cities: City[];
  services: ServiceOpt[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CityInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function openEdit(c: City) {
    setForm({
      id: c.id,
      ad: c.ad,
      slug: c.slug,
      aktif: c.aktif,
      siralama: c.siralama,
      serviceIds: c.services.map((s) => s.id),
    });
    setError(null);
    setOpen(true);
  }

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  function toggleServiceId(id: string) {
    setForm((f) =>
      f.serviceIds.includes(id)
        ? { ...f, serviceIds: f.serviceIds.filter((x) => x !== id) }
        : { ...f, serviceIds: [...f.serviceIds, id] },
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveCity(form);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Şehir kaydedilemedi.");
      }
    });
  }

  function toggle(c: City) {
    startTransition(async () => {
      await toggleCity(c.id, !c.aktif);
      router.refresh();
    });
  }

  function remove(c: City) {
    startTransition(async () => {
      await deleteCity(c.id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={openNew}>+ Yeni Şehir</Button>
      </div>

      {cities.length === 0 ? (
        <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-8 text-center text-cream/50">
          Henüz şehir eklenmedi.
        </p>
      ) : (
        <div className="grid gap-4">
          {cities.map((c) => (
            <CityCard
              key={c.id}
              city={c}
              pending={pending}
              onToggle={() => toggle(c)}
              onEdit={() => openEdit(c)}
              onRemove={() => remove(c)}
            />
          ))}
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
              {form.id ? "Şehri Düzenle" : "Yeni Şehir"}
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
                <label className="mb-2 block text-sm text-cream/60">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">
                  Sıralama
                </label>
                <input
                  type="number"
                  value={form.siralama}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      siralama:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-cream/60">
                  Sunulan Hizmetler
                </label>
                {services.length === 0 ? (
                  <p className="text-xs text-cream/40">
                    Önce hizmet eklemelisiniz.
                  </p>
                ) : (
                  <div className="grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-2">
                    {services.map((s) => (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-cream/75"
                      >
                        <input
                          type="checkbox"
                          checked={form.serviceIds.includes(s.id)}
                          onChange={() => toggleServiceId(s.id)}
                          className="h-4 w-4 accent-gold"
                        />
                        {s.baslik}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-cream/75">
                <input
                  type="checkbox"
                  checked={form.aktif}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                Aktif
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

function CityCard({
  city,
  pending,
  onToggle,
  onEdit,
  onRemove,
}: {
  city: City;
  pending: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const router = useRouter();
  const [locPending, startLocTransition] = useTransition();
  const [locAd, setLocAd] = useState("");
  const [locTip, setLocTip] = useState<LocationTip>("SEMT");

  function addLocation() {
    if (!locAd.trim()) return;
    startLocTransition(async () => {
      await saveLocation({
        cityId: city.id,
        ad: locAd.trim(),
        tip: locTip,
        aktif: true,
      });
      setLocAd("");
      setLocTip("SEMT");
      router.refresh();
    });
  }

  function removeLocation(id: string) {
    startLocTransition(async () => {
      await deleteLocation(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col rounded-[var(--radius)] border hairline bg-surface/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl text-cream">{city.ad}</h3>
          <p className="mt-1 text-sm text-cream/50">
            /{city.slug} · sıra {city.siralama}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-cream/5 px-3 py-1 text-cream/60">
            {city._count.services} hizmet
          </span>
          <span className="rounded-full bg-cream/5 px-3 py-1 text-cream/60">
            {city._count.locations} lokasyon
          </span>
        </div>
      </div>

      <div className="mt-5 border-t hairline pt-4">
        <p className="mb-2 text-sm text-cream/60">Lokasyonlar</p>
        {city.locations.length === 0 ? (
          <p className="text-xs text-cream/40">Henüz lokasyon yok.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {city.locations.map((l) => (
              <span
                key={l.id}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                  l.aktif
                    ? "border-line/70 text-cream/70"
                    : "border-line/70 text-cream/35",
                )}
              >
                {l.ad}
                <span className="text-cream/40">
                  {TIP_ETIKET[l.tip as LocationTip]}
                </span>
                <button
                  onClick={() => removeLocation(l.id)}
                  disabled={locPending}
                  className="text-rose-600/70 transition hover:text-rose-700 disabled:opacity-50"
                  aria-label="Lokasyonu sil"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={locAd}
            onChange={(e) => setLocAd(e.target.value)}
            placeholder="Lokasyon adı"
            className="min-w-[10rem] flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm text-cream outline-none transition focus:border-gold/60"
          />
          <select
            value={locTip}
            onChange={(e) => setLocTip(e.target.value as LocationTip)}
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-cream outline-none transition focus:border-gold/60"
          >
            {TIP_LISTE.map((t) => (
              <option key={t} value={t}>
                {TIP_ETIKET[t]}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={addLocation}
            disabled={locPending || !locAd.trim()}
            className="h-10 px-5 text-xs"
          >
            Ekle
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 border-t hairline pt-4">
        <button
          onClick={onToggle}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50",
            city.aktif
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-line/70 text-cream/50 hover:text-cream",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              city.aktif ? "bg-gold" : "bg-cream/40",
            )}
          />
          {city.aktif ? "Aktif" : "Pasif"}
        </button>

        <button
          onClick={onEdit}
          className="ml-auto text-sm text-gold/80 transition hover:text-gold"
        >
          Düzenle
        </button>
        <button
          onClick={onRemove}
          disabled={pending}
          className="text-sm text-rose-600/80 transition hover:text-rose-700 disabled:opacity-50"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
