"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ServiceIcon } from "@/components/site/ServiceIcon";

type Loc = { id: string; ad: string; tip: string };
type Svc = { id: string; slug: string; baslik: string; kategori: string };
type City = {
  id: string;
  ad: string;
  slug: string;
  services: Svc[];
  locations: Loc[];
};

const ICON: Record<string, string> = {
  CHAUFFEUR: "steering",
  TRANSFER: "route",
  TOUR: "compass",
  GUIDE: "book",
  GREETING: "sparkle",
};

const selectCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-cream outline-none transition focus:border-gold/60";

export function HeroSearch({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [cityId, setCityId] = useState(cities[0]?.id ?? "");

  const city = cities.find((c) => c.id === cityId) ?? cities[0];
  const services = city?.services ?? [];
  const locations = city?.locations ?? [];

  const [serviceSlug, setServiceSlug] = useState(services[0]?.slug ?? "");
  const activeSlug = services.some((s) => s.slug === serviceSlug)
    ? serviceSlug
    : (services[0]?.slug ?? "");

  const [nereden, setNereden] = useState("");
  const [nereye, setNereye] = useState("");
  const [tarih, setTarih] = useState("");

  const activeService = services.find((s) => s.slug === activeSlug);
  const ikiNokta =
    activeService?.kategori === "TRANSFER" ||
    activeService?.kategori === "CHAUFFEUR";

  function onCity(id: string) {
    setCityId(id);
    const c = cities.find((x) => x.id === id);
    if (c && !c.services.some((s) => s.slug === serviceSlug)) {
      setServiceSlug(c.services[0]?.slug ?? "");
    }
    setNereden("");
    setNereye("");
  }

  function submit() {
    const p = new URLSearchParams();
    if (activeSlug) p.set("hizmet", activeSlug);
    if (city) p.set("sehir", city.slug);
    if (nereden) p.set("nereden", nereden);
    if (ikiNokta && nereye) p.set("nereye", nereye);
    if (tarih) p.set("tarih", tarih);
    router.push(`/rezervasyon?${p.toString()}`);
  }

  if (!city) return null;

  return (
    <div className="lift rounded-[calc(var(--radius)+0.4rem)] border hairline bg-white/80 p-4 backdrop-blur-sm sm:p-5">
      {/* Hizmet sekmeleri */}
      <div className="flex flex-wrap gap-2">
        {services.map((s) => {
          const active = s.slug === activeSlug;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setServiceSlug(s.slug)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-gold text-black"
                  : "border border-line text-cream/70 hover:border-gold/40 hover:text-cream"
              }`}
            >
              <ServiceIcon name={ICON[s.kategori] ?? "sparkle"} className="h-4 w-4" />
              {s.baslik}
            </button>
          );
        })}
      </div>

      {/* Arama satırı */}
      <div className="mt-4 grid gap-3 md:grid-cols-[0.9fr_1fr_1fr_0.9fr_auto] md:items-end">
        <Field label="Şehir">
          <select
            value={cityId}
            onChange={(e) => onCity(e.target.value)}
            className={selectCls}
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ad}
              </option>
            ))}
          </select>
        </Field>

        <Field label={ikiNokta ? "Nereden" : "Lokasyon"}>
          <select
            value={nereden}
            onChange={(e) => setNereden(e.target.value)}
            className={selectCls}
          >
            <option value="">Seçiniz</option>
            {locations.map((l) => (
              <option key={l.id} value={l.ad}>
                {l.ad}
              </option>
            ))}
          </select>
        </Field>

        {ikiNokta ? (
          <Field label="Nereye">
            <select
              value={nereye}
              onChange={(e) => setNereye(e.target.value)}
              className={selectCls}
            >
              <option value="">Seçiniz</option>
              {locations.map((l) => (
                <option key={l.id} value={l.ad}>
                  {l.ad}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="hidden md:block" />
        )}

        <Field label="Tarih">
          <input
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            className={selectCls}
          />
        </Field>

        <button
          onClick={submit}
          className="h-[50px] rounded-xl bg-gold px-7 font-semibold text-black shadow-[0_14px_44px_-14px_rgba(168,123,41,0.65)] transition hover:brightness-105"
        >
          Hemen Al
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gold/80">
        {label}
      </span>
      {children}
    </label>
  );
}
