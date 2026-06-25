"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ServiceCategory } from "@prisma/client";
import { useCart } from "@/lib/cart";
import { formatTRY } from "@/lib/format";
import { Button } from "@/components/ui/Button";

type Svc = {
  id: string;
  slug: string;
  baslik: string;
  kategori: ServiceCategory;
  temelFiyat: number;
};
type Veh = { id: string; ad: string; sinif: string; kapasite: number; fiyat: number };

type FieldKey = "alis" | "varis" | "bolge" | "dil" | "tarih" | "saat" | "kisi" | "gun" | "ucus";

const FIELD_LABEL: Record<FieldKey, string> = {
  alis: "Alış / Lokasyon",
  varis: "Varış Noktası",
  bolge: "Bölge / Rota",
  dil: "Rehber Dili",
  tarih: "Tarih",
  saat: "Saat",
  kisi: "Kişi Sayısı",
  gun: "Süre (gün)",
  ucus: "Uçuş No (opsiyonel)",
};

const FIELDS: Record<ServiceCategory, FieldKey[]> = {
  CHAUFFEUR: ["alis", "tarih", "saat", "kisi", "gun"],
  TRANSFER: ["alis", "varis", "tarih", "saat", "kisi", "ucus"],
  TOUR: ["bolge", "tarih", "saat", "kisi", "gun"],
  GUIDE: ["dil", "tarih", "saat", "kisi", "gun"],
  GREETING: ["alis", "tarih", "saat", "kisi", "ucus"],
};

const inputCls =
  "w-full rounded-xl border border-line/70 bg-ink/60 px-4 py-3 text-cream outline-none transition focus:border-gold/60";

export function ReservationForm({
  services,
  vehicles,
  defaultSlug,
}: {
  services: Svc[];
  vehicles: Veh[];
  defaultSlug?: string;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const [serviceId, setServiceId] = useState(
    services.find((s) => s.slug === defaultSlug)?.id ?? services[0]?.id ?? "",
  );
  const [vehicleId, setVehicleId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({ kisi: "1", gun: "1" });
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );
  const showVehicle =
    service?.kategori === "CHAUFFEUR" || service?.kategori === "TRANSFER";
  const fields = service ? FIELDS[service.kategori] : [];

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const birimFiyat =
    (service?.temelFiyat ?? 0) + (showVehicle ? selectedVehicle?.fiyat ?? 0 : 0);

  function set(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!service) return;
    if (!values.tarih) {
      setError("Lütfen bir tarih seçin.");
      return;
    }

    const detay: Record<string, string | number> = {};
    for (const f of fields) {
      const val = values[f];
      if (val) detay[FIELD_LABEL[f]] = val;
    }
    if (showVehicle && selectedVehicle) detay["Araç"] = selectedVehicle.ad;

    const adet =
      service.kategori === "CHAUFFEUR" ||
      service.kategori === "TOUR" ||
      service.kategori === "GUIDE"
        ? Math.max(1, Number(values.gun || 1))
        : 1;

    add({
      serviceId: service.id,
      serviceSlug: service.slug,
      serviceTitle: service.baslik,
      kategori: service.kategori,
      vehicleId: showVehicle ? selectedVehicle?.id : undefined,
      vehicleName: showVehicle ? selectedVehicle?.ad : undefined,
      detay,
      birimFiyat,
      adet,
    });
    router.push("/sepet");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm text-cream/60">Hizmet</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  serviceId === s.id
                    ? "border-gold/60 bg-gold/10 text-cream"
                    : "border-line/60 bg-surface/30 text-cream/70 hover:border-gold/30"
                }`}
              >
                {s.baslik}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f} className={f === "alis" || f === "varis" || f === "bolge" ? "sm:col-span-2" : ""}>
              <label className="mb-2 block text-sm text-cream/60">
                {FIELD_LABEL[f]}
              </label>
              <input
                className={inputCls}
                type={f === "tarih" ? "date" : f === "saat" ? "time" : f === "kisi" || f === "gun" ? "number" : "text"}
                min={f === "kisi" || f === "gun" ? 1 : undefined}
                value={values[f] ?? ""}
                onChange={(e) => set(f, e.target.value)}
                placeholder={FIELD_LABEL[f]}
              />
            </div>
          ))}

          {showVehicle && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-cream/60">Araç Sınıfı</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {vehicles.map((v) => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => setVehicleId(v.id)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                      vehicleId === v.id
                        ? "border-gold/60 bg-gold/10"
                        : "border-line/60 bg-surface/30 hover:border-gold/30"
                    }`}
                  >
                    <span>
                      <span className="text-cream">{v.ad}</span>
                      <span className="block text-xs text-cream/45">
                        {v.kapasite} kişi
                      </span>
                    </span>
                    <span className="text-xs text-gold">
                      {v.fiyat > 0 ? `+${formatTRY(v.fiyat)}` : "Dahil"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>

      {/* özet */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="glass rounded-[var(--radius)] p-7">
          <h3 className="text-xl">{service?.baslik ?? "Hizmet seçin"}</h3>
          <div className="mt-5 space-y-2 text-sm text-cream/60">
            <div className="flex justify-between">
              <span>Birim fiyat</span>
              <span className="text-cream">{formatTRY(birimFiyat)}</span>
            </div>
            {(values.gun && (service?.kategori === "CHAUFFEUR" || service?.kategori === "TOUR" || service?.kategori === "GUIDE")) ? (
              <div className="flex justify-between">
                <span>Süre</span>
                <span className="text-cream">{values.gun} gün</span>
              </div>
            ) : null}
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full">
            Sepete Ekle
          </Button>
          <p className="mt-3 text-center text-xs text-cream/40">
            Ödeme alınmaz — talebiniz ekibimize iletilir.
          </p>
        </div>
      </aside>
    </form>
  );
}
