"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  kategori: string;
  vehicleId?: string;
  vehicleName?: string;
  detay: Record<string, string | number>;
  birimFiyat: number;
  adet: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: [
            ...s.items,
            { ...item, id: Math.random().toString(36).slice(2, 10) },
          ],
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.birimFiyat * i.adet, 0),
      count: () => get().items.reduce((n, i) => n + i.adet, 0),
    }),
    { name: "vipdrive-cart" },
  ),
);
