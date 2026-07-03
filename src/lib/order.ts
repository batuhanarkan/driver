import type { OrderStatus } from "@prisma/client";

export interface PricedItem {
  birimFiyat: number;
  adet: number;
}

/** Tek satır toplamı — negatif/0 adet korumalı. */
export function itemTotal(item: PricedItem): number {
  const fiyat = Math.max(0, Math.round(item.birimFiyat));
  const adet = Math.max(1, Math.round(item.adet));
  return fiyat * adet;
}

/** Sipariş toplamı. */
export function orderTotal(items: PricedItem[]): number {
  return items.reduce((sum, i) => sum + itemTotal(i), 0);
}

/** İnsan-okunur sipariş numarası (Node runtime). */
export function generateOrderNumber(): string {
  const t = Date.now().toString(36).toUpperCase().slice(-6);
  const r = Math.floor(Math.random() * 36)
    .toString(36)
    .toUpperCase();
  return `VD-${t}${r}`;
}

/**
 * Sipariş detay JSON'unu görüntü satırlarına çevirir.
 * "X Konumu" anahtarları ayrı satır olmaz; ilgili "X" satırına harita linki olarak iliştirilir.
 */
export type DetayRow = { label: string; value: string; mapUrl?: string };

/**
 * Harita linkini href'e koymadan önce güvenli hale getirir.
 * detay JSON'u misafir client'tan geldiği için `javascript:`/`data:` gibi
 * şemalar reddedilir (admin panelinde stored-XSS'i engeller).
 */
function safeMapUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:"
      ? u.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

// Mantıklı görüntü sırası (JSON/jsonb anahtar sırası güvenilmez).
const DETAY_ORDER = [
  "Kalkış",
  "Karşılama Noktası",
  "Durak 1",
  "Durak 2",
  "Durak 3",
  "Durak 4",
  "Durak 5",
  "Varış",
  "Bölge / Rota",
  "Rehber Dili",
  "Tarih",
  "Saat",
  "Kişi Sayısı",
  "Süre (gün)",
  "Uçuş No",
];

export function detayRows(
  detay: Record<string, string | number>,
): DetayRow[] {
  const rows: DetayRow[] = [];
  for (const [k, v] of Object.entries(detay)) {
    if (k.endsWith(" Konumu")) continue; // ana satıra iliştirilir
    rows.push({
      label: k,
      value: String(v),
      mapUrl: safeMapUrl(detay[`${k} Konumu`]),
    });
  }
  const rank = (l: string) => {
    const i = DETAY_ORDER.indexOf(l);
    return i === -1 ? DETAY_ORDER.length : i;
  };
  return rows.sort((a, b) => rank(a.label) - rank(b.label));
}

/** Sipariş durum makinesi: her durumdan izin verilen geçişler. */
export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  BEKLEMEDE: ["ONAYLANDI", "IPTAL"],
  ONAYLANDI: ["DEVAM_EDIYOR", "IPTAL"],
  DEVAM_EDIYOR: ["TAMAMLANDI", "IPTAL"],
  TAMAMLANDI: [],
  IPTAL: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_FLOW[from]?.includes(to) ?? false;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  BEKLEMEDE: "Beklemede",
  ONAYLANDI: "Onaylandı",
  DEVAM_EDIYOR: "Devam Ediyor",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
};

/** Durum rozeti için renk sınıfı (Tailwind). */
export const STATUS_STYLE: Record<OrderStatus, string> = {
  BEKLEMEDE: "bg-amber-500/15 text-amber-700 border-amber-600/30",
  ONAYLANDI: "bg-sky-500/15 text-sky-700 border-sky-600/30",
  DEVAM_EDIYOR: "bg-violet-500/15 text-violet-700 border-violet-600/30",
  TAMAMLANDI: "bg-emerald-500/15 text-emerald-700 border-emerald-600/30",
  IPTAL: "bg-rose-500/15 text-rose-700 border-rose-600/30",
};
