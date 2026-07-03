"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations/order";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";
import { orderTotal, generateOrderNumber } from "@/lib/order";
import { getDistrictsByProvince } from "@/lib/geo";

export type CreateOrderResult =
  | { ok: true; siparisNo: string }
  | { ok: false; error: string };

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  // Fiyatları daima DB'den hesapla — client'tan gelen fiyata güvenme.
  const serviceIds = [...new Set(parsed.data.items.map((i) => i.serviceId))];
  const services = await db.service.findMany({ where: { id: { in: serviceIds } } });
  const vehicleIds = parsed.data.items
    .map((i) => i.vehicleId)
    .filter((v): v is string => Boolean(v));
  const vehicles = vehicleIds.length
    ? await db.vehicle.findMany({ where: { id: { in: vehicleIds } } })
    : [];

  const itemsData = [];
  for (const i of parsed.data.items) {
    const svc = services.find((s) => s.id === i.serviceId);
    if (!svc) return { ok: false, error: "Geçersiz hizmet seçimi." };
    const veh = i.vehicleId ? vehicles.find((v) => v.id === i.vehicleId) : undefined;
    const birimFiyat = svc.temelFiyat + (veh?.fiyat ?? 0);
    itemsData.push({
      serviceId: svc.id,
      vehicleId: veh?.id ?? null,
      detay: i.detay,
      birimFiyat,
      adet: i.adet,
    });
  }

  const toplam = orderTotal(itemsData);
  const order = await db.order.create({
    data: {
      siparisNo: generateOrderNumber(),
      musteriAd: parsed.data.musteriAd,
      musteriEmail: parsed.data.musteriEmail,
      musteriTelefon: parsed.data.musteriTelefon,
      toplamTutar: toplam,
      not: parsed.data.not,
      items: { create: itemsData },
    },
  });

  // NOT: Sipariş e-postası bildirimi sonraki adımda eklenecek (mail seam hazır).
  revalidatePath("/admin/siparisler");
  revalidatePath("/admin");
  return { ok: true, siparisNo: order.siparisNo };
}

/** Client kaskad için: seçilen ilin ilçeleri. */
export async function fetchDistricts(provinceId: string) {
  return getDistrictsByProvince(provinceId);
}

export async function createLead(
  input: LeadInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  await db.lead.create({
    data: {
      tip: parsed.data.tip,
      ad: parsed.data.ad,
      email: parsed.data.email,
      telefon: parsed.data.telefon || null,
      mesaj: parsed.data.mesaj,
    },
  });
  revalidatePath("/admin/talepler");
  return { ok: true };
}
