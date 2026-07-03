"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceCategory } from "@prisma/client";
import { formatTRY } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/app/(web)/actions";
import {
  LocationPicker,
  emptyLocation,
  locationLabel,
  mapsLink,
  type LocationValue,
} from "@/components/site/LocationPicker";
import type { ProvinceLite } from "@/lib/geo";

type Svc = {
  id: string;
  slug: string;
  baslik: string;
  kategori: ServiceCategory;
  temelFiyat: number;
};

const inputCls =
  "w-full rounded-xl border border-line/70 bg-ink-2 px-4 py-3 text-cream outline-none transition focus:border-gold/60";

const MAX_DURAK = 5;

// İl + ilçe + mahalle zorunlu (mahalle kaydı olmayan ilçede il+ilçe yeterli).
function eksikAlan(v: LocationValue): string | null {
  if (!v.provinceId) return "il";
  if (!v.districtId) return "ilçe";
  if (!v.mahalleYok && !v.mahalleId) return "mahalle";
  return null;
}

export function ReservationForm({
  services,
  provinces,
  defaultSlug,
  defaults,
}: {
  services: Svc[];
  provinces: ProvinceLite[];
  defaultSlug?: string;
  defaults?: { ilSlug?: string; tarih?: string; durak?: number };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const defaultProvince = provinces.find((p) => p.slug === defaults?.ilSlug);
  const initLoc = (): LocationValue =>
    defaultProvince
      ? { ...emptyLocation, provinceId: defaultProvince.id, provinceAd: defaultProvince.ad }
      : { ...emptyLocation };

  const [serviceId, setServiceId] = useState(
    services.find((s) => s.slug === defaultSlug)?.id ?? services[0]?.id ?? "",
  );
  const [kalkis, setKalkis] = useState<LocationValue>(initLoc);
  const [varis, setVaris] = useState<LocationValue>(() => ({ ...emptyLocation }));
  const [duraklar, setDuraklar] = useState<LocationValue[]>(() =>
    Array.from({ length: Math.min(MAX_DURAK, Math.max(0, defaults?.durak ?? 0)) }, () => ({
      ...emptyLocation,
    })),
  );
  const [durakVar, setDurakVar] = useState<boolean>((defaults?.durak ?? 0) > 0);
  const [values, setValues] = useState<Record<string, string>>({
    kisi: "1",
    gun: "1",
    ...(defaults?.tarih ? { tarih: defaults.tarih } : {}),
  });
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [not, setNot] = useState("");
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );
  const kat = service?.kategori;

  const isRoute = kat === "TRANSFER" || kat === "CHAUFFEUR";
  const isGreeting = kat === "GREETING";
  const showUcus = kat === "TRANSFER" || kat === "GREETING";
  const showGun = kat === "CHAUFFEUR" || kat === "TOUR" || kat === "GUIDE";
  const showBolge = kat === "TOUR";
  const showDil = kat === "GUIDE";

  const birimFiyat = service?.temelFiyat ?? 0;

  function set(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }
  function setDurak(i: number, v: LocationValue) {
    setDuraklar((d) => d.map((x, idx) => (idx === i ? v : x)));
  }
  function addDurak() {
    setDuraklar((d) => (d.length >= MAX_DURAK ? d : [...d, { ...emptyLocation }]));
  }
  function removeDurak(i: number) {
    setDuraklar((d) => d.filter((_, idx) => idx !== i));
  }
  function toggleDurakVar(v: boolean) {
    setDurakVar(v);
    if (v && duraklar.length === 0) setDuraklar([{ ...emptyLocation }]);
    if (!v) setDuraklar([]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!service) return;
    if (!values.tarih) return setError("Lütfen bir tarih seçin.");
    if (isRoute || isGreeting) {
      const ek = eksikAlan(kalkis);
      if (ek)
        return setError(`${isGreeting ? "Karşılama noktası" : "Kalkış"} için ${ek} seçin.`);
    }
    if (isRoute) {
      const ek = eksikAlan(varis);
      if (ek) return setError(`Varış için ${ek} seçin.`);
    }
    if (isRoute && durakVar) {
      if (duraklar.length === 0)
        return setError("Durak için 'Hayır' seçin ya da en az bir durak ekleyin.");
      for (let i = 0; i < duraklar.length; i++) {
        const ek = eksikAlan(duraklar[i]);
        if (ek) return setError(`Durak ${i + 1} için ${ek} seçin.`);
      }
    }

    // İletişim
    if (ad.trim().length < 2) return setError("Lütfen ad soyad girin.");
    if (!/.+@.+\..+/.test(email)) return setError("Lütfen geçerli bir e-posta girin.");
    if (telefon.trim().length < 10) return setError("Lütfen geçerli bir telefon girin.");

    const detay: Record<string, string | number> = {};

    if (isRoute || isGreeting) {
      detay[isGreeting ? "Karşılama Noktası" : "Kalkış"] = locationLabel(kalkis);
      const kl = mapsLink(kalkis);
      if (kl) detay[isGreeting ? "Karşılama Konumu" : "Kalkış Konumu"] = kl;
    }
    if (isRoute) {
      detay["Varış"] = locationLabel(varis);
      const vl = mapsLink(varis);
      if (vl) detay["Varış Konumu"] = vl;
      duraklar.forEach((d, i) => {
        if (!d.provinceId) return;
        detay[`Durak ${i + 1}`] = locationLabel(d);
        const dl = mapsLink(d);
        if (dl) detay[`Durak ${i + 1} Konumu`] = dl;
      });
    }
    if (showBolge && values.bolge) detay["Bölge / Rota"] = values.bolge;
    if (showDil && values.dil) detay["Rehber Dili"] = values.dil;
    detay["Tarih"] = values.tarih;
    if (values.saat) detay["Saat"] = values.saat;
    detay["Kişi Sayısı"] = values.kisi || "1";
    if (showGun) detay["Süre (gün)"] = values.gun || "1";
    if (showUcus && values.ucus) detay["Uçuş No"] = values.ucus;

    const adet = showGun ? Math.max(1, Number(values.gun || 1)) : 1;

    startTransition(async () => {
      const res = await createOrder({
        musteriAd: ad.trim(),
        musteriEmail: email.trim(),
        musteriTelefon: telefon.trim(),
        items: [{ serviceId: service.id, detay, adet }],
        not: not || undefined,
      });
      if (res.ok) router.push(`/siparis-alindi?no=${res.siparisNo}`);
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        {/* Hizmet seçimi */}
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

        {/* Konum bölümü */}
        {(isRoute || isGreeting) && (
          <div className="space-y-3">
            <LocationPicker
              label={isGreeting ? "Karşılama Noktası" : "Kalkış (nereden)"}
              provinces={provinces}
              value={kalkis}
              onChange={setKalkis}
              accent="kalkis"
            />

            {isRoute && (
              <LocationPicker
                label="Varış (nereye)"
                provinces={provinces}
                value={varis}
                onChange={setVaris}
                accent="varis"
              />
            )}

            {isRoute && (
              <div className="rounded-[var(--radius)] border hairline bg-surface/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-cream/80">
                      Yolculukta durak var mı?
                    </p>
                    <p className="text-xs text-cream/45">
                      Örn. yol üstünden birini almak için ara nokta ekleyin.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDurakVar(false)}
                      className={`rounded-xl border px-5 py-2 text-sm transition ${
                        !durakVar
                          ? "border-gold/60 bg-gold/10 text-cream"
                          : "border-line/60 text-cream/60 hover:border-gold/30"
                      }`}
                    >
                      Hayır
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDurakVar(true)}
                      className={`rounded-xl border px-5 py-2 text-sm transition ${
                        durakVar
                          ? "border-gold/60 bg-gold/10 text-cream"
                          : "border-line/60 text-cream/60 hover:border-gold/30"
                      }`}
                    >
                      Evet
                    </button>
                  </div>
                </div>

                {durakVar && (
                  <div className="mt-4 space-y-3">
                    {duraklar.map((d, i) => (
                      <div key={i} className="relative">
                        <LocationPicker
                          label={`Durak ${i + 1}`}
                          provinces={provinces}
                          value={d}
                          onChange={(v) => setDurak(i, v)}
                          accent="durak"
                        />
                        {duraklar.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDurak(i)}
                            className="absolute right-4 top-4 text-xs text-cream/45 transition hover:text-rose-600"
                          >
                            Kaldır
                          </button>
                        )}
                      </div>
                    ))}
                    {duraklar.length < MAX_DURAK && (
                      <button
                        type="button"
                        onClick={addDurak}
                        className="w-full rounded-xl border border-dashed border-line/70 py-3 text-sm text-cream/60 transition hover:border-gold/50 hover:text-gold"
                      >
                        + Durak ekle ({duraklar.length}/{MAX_DURAK})
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Kategori metin alanları */}
        <div className="grid gap-4 sm:grid-cols-2">
          {showBolge && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-cream/60">Bölge / Rota</label>
              <input className={inputCls} value={values.bolge ?? ""} onChange={(e) => set("bolge", e.target.value)} placeholder="Örn. Tarihi Yarımada turu" />
            </div>
          )}
          {showDil && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-cream/60">Rehber Dili</label>
              <input className={inputCls} value={values.dil ?? ""} onChange={(e) => set("dil", e.target.value)} placeholder="Örn. İngilizce" />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-cream/60">Tarih</label>
            <input className={inputCls} type="date" value={values.tarih ?? ""} onChange={(e) => set("tarih", e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-cream/60">Saat</label>
            <input className={inputCls} type="time" value={values.saat ?? ""} onChange={(e) => set("saat", e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-cream/60">Kişi Sayısı</label>
            <input className={inputCls} type="number" min={1} value={values.kisi ?? "1"} onChange={(e) => set("kisi", e.target.value)} />
          </div>
          {showGun && (
            <div>
              <label className="mb-2 block text-sm text-cream/60">Süre (gün)</label>
              <input className={inputCls} type="number" min={1} value={values.gun ?? "1"} onChange={(e) => set("gun", e.target.value)} />
            </div>
          )}
          {showUcus && (
            <div>
              <label className="mb-2 block text-sm text-cream/60">Uçuş No (opsiyonel)</label>
              <input className={inputCls} value={values.ucus ?? ""} onChange={(e) => set("ucus", e.target.value)} placeholder="TK1234" />
            </div>
          )}
        </div>
      </div>

      {/* özet + iletişim + gönder */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="glass rounded-[var(--radius)] p-7">
          <h3 className="text-xl">{service?.baslik ?? "Hizmet seçin"}</h3>

          {(isRoute || isGreeting) && kalkis.provinceId ? (
            <div className="mt-4 space-y-1 text-sm text-cream/60">
              <p>
                <span className="text-cream/40">{isGreeting ? "Nokta: " : "Kalkış: "}</span>
                {locationLabel(kalkis)}
              </p>
              {isRoute && varis.provinceId && (
                <p>
                  <span className="text-cream/40">Varış: </span>
                  {locationLabel(varis)}
                </p>
              )}
              {isRoute && duraklar.filter((d) => d.provinceId).length > 0 && (
                <p className="text-cream/50">
                  {duraklar.filter((d) => d.provinceId).length} durak
                </p>
              )}
            </div>
          ) : null}

          <div className="mt-5 space-y-2 border-t hairline pt-5 text-sm text-cream/60">
            <div className="flex justify-between">
              <span>Birim fiyat</span>
              <span className="text-cream">{formatTRY(birimFiyat)}</span>
            </div>
            {showGun && values.gun ? (
              <div className="flex justify-between">
                <span>Süre</span>
                <span className="text-cream">{values.gun} gün</span>
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-3 border-t hairline pt-5">
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
            <textarea
              className={inputCls}
              rows={2}
              placeholder="Not (opsiyonel)"
              value={not}
              onChange={(e) => setNot(e.target.value)}
            />
          </div>

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <Button type="submit" size="lg" disabled={pending} className="mt-5 w-full">
            {pending ? "Gönderiliyor..." : "Talebi Gönder"}
          </Button>
          <p className="mt-3 text-center text-xs text-cream/40">
            Ödeme alınmaz — talebiniz ekibimize iletilir.
          </p>
        </div>
      </aside>
    </form>
  );
}
