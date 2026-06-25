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
  BEKLEMEDE: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ONAYLANDI: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  DEVAM_EDIYOR: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  TAMAMLANDI: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  IPTAL: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};
