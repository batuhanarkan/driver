"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Harici görsel gerektirmeyen, temaya uygun altın pin (offline'da da çalışır).
const pinIcon = L.divIcon({
  className: "vipdrive-pin",
  html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#a97e2e;border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.35)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

type LatLng = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({
  center,
  value,
  title,
  zoom,
  onConfirm,
  onClose,
}: {
  center: LatLng;
  value: LatLng | null;
  title: string;
  zoom?: number;
  onConfirm: (p: LatLng) => void;
  onClose: () => void;
}) {
  const [pos, setPos] = useState<LatLng | null>(value);
  const start = value ?? center;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[var(--radius)] border hairline bg-surface shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b hairline px-5 py-4">
          <div>
            <h3 className="font-display text-lg text-cream">{title}</h3>
            <p className="text-xs text-cream/50">Haritaya dokunarak konumu işaretleyin.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/70 text-cream/70 transition hover:text-cream"
          >
            ✕
          </button>
        </div>

        <div className="h-[55vh] w-full">
          <MapContainer
            center={[start.lat, start.lng]}
            zoom={zoom ?? (value ? 15 : 11)}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onPick={setPos} />
            {pos && <Marker position={[pos.lat, pos.lng]} icon={pinIcon} />}
          </MapContainer>
        </div>

        <div className="flex items-center justify-between gap-4 border-t hairline px-5 py-4">
          <span className="text-xs text-cream/55">
            {pos
              ? `Seçildi: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`
              : "Henüz konum seçilmedi"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line/70 px-4 py-2 text-sm text-cream/70 transition hover:text-cream"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={!pos}
              onClick={() => pos && onConfirm(pos)}
              className="rounded-xl bg-gold px-5 py-2 text-sm font-semibold text-black transition hover:brightness-105 disabled:opacity-40"
            >
              Konumu Onayla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
