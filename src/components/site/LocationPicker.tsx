"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchDistricts, fetchNeighborhoods } from "@/app/(web)/actions";
import type { ProvinceLite } from "@/lib/geo";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

export type LocationValue = {
  provinceId: string;
  provinceAd: string;
  districtId: string;
  districtAd: string;
  mahalleId: string;
  mahalleAd: string;
  mahalleYok: boolean; // seçili ilçenin kayıtlı mahallesi yoksa true
  adres: string; // opsiyonel detay: bina, kapı no, tarif
  lat: number | null;
  lng: number | null;
};

export const emptyLocation: LocationValue = {
  provinceId: "",
  provinceAd: "",
  districtId: "",
  districtAd: "",
  mahalleId: "",
  mahalleAd: "",
  mahalleYok: false,
  adres: "",
  lat: null,
  lng: null,
};

// Hiçbir il seçili değilken haritanın varsayılan odağı: İstanbul.
const DEFAULT_CENTER = { lat: 41.0082, lng: 28.9784 };

const fieldCls =
  "w-full rounded-xl border border-line/70 bg-ink-2 px-4 py-3 text-cream outline-none transition focus:border-gold/60 disabled:opacity-60";

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" />
    </svg>
  );
}

function SelectWrap({
  loading,
  children,
}: {
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
        {loading ? <Spinner /> : null}
      </span>
    </div>
  );
}

export function LocationPicker({
  label,
  provinces,
  value,
  onChange,
  accent,
}: {
  label: string;
  provinces: ProvinceLite[];
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  accent?: "kalkis" | "varis" | "durak";
}) {
  const [districts, setDistricts] = useState<{ id: string; ad: string }[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<{ id: string; ad: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMahalle, setLoadingMahalle] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolved, setResolved] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  // İl değişince ilçeleri yükle (ilk mount dahil).
  useEffect(() => {
    let active = true;
    if (!value.provinceId) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    fetchDistricts(value.provinceId).then((d) => {
      if (active) {
        setDistricts(d);
        setLoadingDistricts(false);
      }
    });
    return () => {
      active = false;
    };
  }, [value.provinceId]);

  // İlçe değişince mahalleleri yükle + "mahalle yok" bayrağını güncelle.
  useEffect(() => {
    let active = true;
    if (!value.districtId) {
      setNeighborhoods([]);
      return;
    }
    setLoadingMahalle(true);
    fetchNeighborhoods(value.districtId).then((n) => {
      if (!active) return;
      setNeighborhoods(n);
      setLoadingMahalle(false);
      const yok = n.length === 0;
      if (value.mahalleYok !== yok) onChange({ ...value, mahalleYok: yok });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.districtId]);

  const prov = provinces.find((p) => p.id === value.provinceId);
  const mapCenter = prov ? { lat: prov.lat, lng: prov.lng } : DEFAULT_CENTER;

  // Haritayı açarken seçili mahalle/ilçe/il'i geocode edip oraya odakla (opsiyonel kolaylık).
  async function openMap() {
    if (value.lat != null || !value.provinceId) {
      setResolved(null);
      setMapOpen(true);
      return;
    }
    setLocating(true);
    let center = mapCenter;
    let zoom = 11;
    try {
      const q = [value.mahalleAd, value.districtAd, value.provinceAd, "Türkiye"]
        .filter(Boolean)
        .join(", ");
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tr&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data[0]) {
        center = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        zoom = value.mahalleAd ? 16 : value.districtAd ? 14 : 12;
      }
    } catch {
      /* geocode hatası: il merkezine düş */
    }
    setLocating(false);
    setResolved({ center, zoom });
    setMapOpen(true);
  }

  const dot =
    accent === "kalkis"
      ? "bg-emerald-500"
      : accent === "varis"
        ? "bg-rose-500"
        : "bg-gold";

  return (
    <div className="rounded-[var(--radius)] border hairline bg-surface/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-sm font-medium text-cream/80">{label}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* İl */}
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
              mahalleId: "",
              mahalleAd: "",
              mahalleYok: false,
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

        {/* İlçe */}
        <SelectWrap loading={loadingDistricts}>
          <select
            className={fieldCls}
            value={value.districtId}
            disabled={!value.provinceId || loadingDistricts}
            onChange={(e) => {
              const d = districts.find((x) => x.id === e.target.value);
              onChange({
                ...value,
                districtId: e.target.value,
                districtAd: d?.ad ?? "",
                mahalleId: "",
                mahalleAd: "",
                mahalleYok: false,
              });
            }}
          >
            <option value="">
              {!value.provinceId ? "Önce il" : loadingDistricts ? "Yükleniyor…" : "İlçe seçin"}
            </option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.ad}
              </option>
            ))}
          </select>
        </SelectWrap>
      </div>

      {/* Mahalle */}
      <div className="mt-3">
        <SelectWrap loading={loadingMahalle}>
          <select
            className={fieldCls}
            value={value.mahalleId}
            disabled={!value.districtId || loadingMahalle || neighborhoods.length === 0}
            onChange={(e) => {
              const m = neighborhoods.find((x) => x.id === e.target.value);
              onChange({ ...value, mahalleId: e.target.value, mahalleAd: m?.ad ?? "" });
            }}
          >
            <option value="">
              {!value.districtId
                ? "Önce ilçe"
                : loadingMahalle
                  ? "Yükleniyor…"
                  : neighborhoods.length === 0
                    ? "Bu ilçede mahalle kaydı yok"
                    : "Mahalle seçin"}
            </option>
            {neighborhoods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ad}
              </option>
            ))}
          </select>
        </SelectWrap>
      </div>

      {/* Adres detayı (opsiyonel) */}
      <input
        className={`${fieldCls} mt-3`}
        placeholder="Adres detayı — bina, kapı no, tarif (opsiyonel)"
        value={value.adres}
        onChange={(e) => onChange({ ...value, adres: e.target.value })}
      />

      {/* Harita (opsiyonel) */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openMap}
          disabled={locating}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition disabled:opacity-70 ${
            value.lat != null
              ? "border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
              : "border-gold/40 text-gold hover:bg-gold/10"
          }`}
        >
          {locating ? (
            <Spinner />
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
          )}
          {locating
            ? "Konum bulunuyor…"
            : value.lat != null
              ? "Haritada işaretlendi ✓"
              : "Haritadan işaretle (opsiyonel)"}
        </button>
        {value.lat != null && (
          <button
            type="button"
            onClick={() => onChange({ ...value, lat: null, lng: null })}
            className="text-xs text-cream/45 transition hover:text-rose-600"
          >
            Temizle
          </button>
        )}
      </div>

      {mapOpen && (
        <MapPicker
          title={`${label} — haritadan işaretle`}
          center={resolved?.center ?? mapCenter}
          zoom={resolved?.zoom}
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
  const parts = [v.provinceAd, v.districtAd, v.mahalleAd].filter(Boolean).join(" / ");
  return v.adres ? `${parts} — ${v.adres}` : parts || "—";
}

export function mapsLink(v: LocationValue): string | null {
  if (v.lat == null || v.lng == null) return null;
  return `https://www.google.com/maps?q=${v.lat},${v.lng}`;
}
