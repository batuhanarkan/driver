"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { fetchDistricts } from "@/app/(web)/actions";
import type { ProvinceLite } from "@/lib/geo";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

export type LocationValue = {
  provinceId: string;
  provinceAd: string;
  districtId: string;
  districtAd: string;
  adres: string;
  lat: number | null;
  lng: number | null;
};

export const emptyLocation: LocationValue = {
  provinceId: "",
  provinceAd: "",
  districtId: "",
  districtAd: "",
  adres: "",
  lat: null,
  lng: null,
};

const TR_CENTER = { lat: 39.0, lng: 35.0 };

const fieldCls =
  "w-full rounded-xl border border-line/70 bg-ink-2 px-4 py-3 text-cream outline-none transition focus:border-gold/60";

type Suggestion = { label: string; short: string; lat: number; lng: number };

export function LocationPicker({
  label,
  provinces,
  value,
  onChange,
  accent,
  requireMap,
}: {
  label: string;
  provinces: ProvinceLite[];
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  accent?: "kalkis" | "varis" | "durak";
  requireMap?: boolean;
}) {
  const [districts, setDistricts] = useState<{ id: string; ad: string }[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [openSug, setOpenSug] = useState(false);
  const [searching, setSearching] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // İl değişince ilçeleri yükle (ilk mount dahil).
  useEffect(() => {
    let active = true;
    if (!value.provinceId) {
      setDistricts([]);
      return;
    }
    fetchDistricts(value.provinceId).then((d) => {
      if (active) setDistricts(d);
    });
    return () => {
      active = false;
    };
  }, [value.provinceId]);

  const prov = provinces.find((p) => p.id === value.provinceId);
  const mapCenter = prov ? { lat: prov.lat, lng: prov.lng } : TR_CENTER;

  const dot =
    accent === "kalkis"
      ? "bg-emerald-500"
      : accent === "varis"
        ? "bg-rose-500"
        : "bg-gold";

  // OSM/Nominatim üzerinden mahalle/cadde/sokak araması (il+ilçe ile daraltılır).
  function search(text: string) {
    if (debRef.current) clearTimeout(debRef.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      setOpenSug(false);
      return;
    }
    debRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setSearching(true);
      try {
        const scope = [text, value.districtAd, value.provinceAd, "Türkiye"]
          .filter(Boolean)
          .join(", ");
        const url =
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1` +
          `&limit=6&countrycodes=tr&accept-language=tr&q=${encodeURIComponent(scope)}`;
        const res = await fetch(url, { signal: ac.signal });
        const data = (await res.json()) as Array<{
          display_name: string;
          lat: string;
          lon: string;
        }>;
        const sug: Suggestion[] = (Array.isArray(data) ? data : []).map((d) => ({
          label: d.display_name,
          short: d.display_name.split(",").slice(0, 3).map((s) => s.trim()).join(", "),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
        }));
        setSuggestions(sug);
        setOpenSug(sug.length > 0);
      } catch {
        /* iptal ya da ağ hatası: sessizce geç, harita alternatifi var */
      } finally {
        setSearching(false);
      }
    }, 350);
  }

  function pickSuggestion(s: Suggestion) {
    onChange({ ...value, adres: s.short, lat: s.lat, lng: s.lng });
    setSuggestions([]);
    setOpenSug(false);
  }

  return (
    <div className="rounded-[var(--radius)] border hairline bg-surface/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-sm font-medium text-cream/80">{label}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          className={fieldCls}
          value={value.provinceId}
          onChange={(e) => {
            const p = provinces.find((x) => x.id === e.target.value);
            onChange({
              ...value,
              provinceId: e.target.value,
              provinceAd: p?.ad ?? "",
              districtId: "",
              districtAd: "",
            });
          }}
        >
          <option value="">İl seçin</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.ad}
            </option>
          ))}
        </select>

        <select
          className={fieldCls}
          value={value.districtId}
          disabled={!value.provinceId}
          onChange={(e) => {
            const d = districts.find((x) => x.id === e.target.value);
            onChange({
              ...value,
              districtId: e.target.value,
              districtAd: d?.ad ?? "",
            });
          }}
        >
          <option value="">{value.provinceId ? "İlçe seçin" : "Önce il"}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.ad}
            </option>
          ))}
        </select>
      </div>

      {/* Mahalle / cadde / sokak araması (otomatik tamamlama) */}
      <div className="relative mt-3">
        <input
          className={fieldCls}
          placeholder="Mahalle / cadde / sokak yazıp seçin"
          value={value.adres}
          onChange={(e) => {
            onChange({ ...value, adres: e.target.value });
            search(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setOpenSug(true)}
          onBlur={() => setTimeout(() => setOpenSug(false), 150)}
          autoComplete="off"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cream/40">
            aranıyor…
          </span>
        )}
        {openSug && suggestions.length > 0 && (
          <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface shadow-xl">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickSuggestion(s);
                  }}
                  className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm text-cream/80 transition hover:bg-gold/10"
                >
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2.4" />
                  </svg>
                  <span>{s.short}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
            value.lat != null
              ? "border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
              : "border-gold/40 text-gold hover:bg-gold/10"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2.4" />
          </svg>
          {value.lat != null ? "Konum işaretlendi ✓" : "Haritadan konum seç"}
        </button>
        {value.lat != null ? (
          <button
            type="button"
            onClick={() => onChange({ ...value, lat: null, lng: null })}
            className="text-xs text-cream/45 transition hover:text-rose-600"
          >
            Temizle
          </button>
        ) : requireMap ? (
          <span className="text-xs font-medium text-amber-600">Konum zorunlu</span>
        ) : null}
      </div>

      {mapOpen && (
        <MapPicker
          title={`${label} — haritadan seç`}
          center={mapCenter}
          value={value.lat != null && value.lng != null ? { lat: value.lat, lng: value.lng } : null}
          onClose={() => setMapOpen(false)}
          onConfirm={(p) => {
            onChange({ ...value, lat: p.lat, lng: p.lng });
            setMapOpen(false);
          }}
        />
      )}
    </div>
  );
}

/** detay/özet için okunabilir konum metni. */
export function locationLabel(v: LocationValue): string {
  const parts = [v.provinceAd, v.districtAd].filter(Boolean).join(" / ");
  const withAdres = v.adres ? `${parts} — ${v.adres}` : parts;
  return withAdres || "—";
}

export function mapsLink(v: LocationValue): string | null {
  if (v.lat == null || v.lng == null) return null;
  return `https://www.google.com/maps?q=${v.lat},${v.lng}`;
}
