"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canTransition } from "@/lib/order";
import type { OrderStatus, ServiceCategory } from "@prisma/client";

export type ActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Yetkisiz erişim");
  }
}

export async function updateOrderStatus(
  orderId: string,
  durum: OrderStatus,
): Promise<ActionResult> {
  await requireAdmin();
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Sipariş bulunamadı." };
  if (!canTransition(order.durum, durum)) {
    return { ok: false, error: "Bu durum geçişine izin verilmiyor." };
  }
  await db.order.update({ where: { id: orderId }, data: { durum } });
  revalidatePath("/admin/siparisler");
  revalidatePath(`/admin/siparisler/${orderId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export type ServiceInput = {
  id?: string;
  slug: string;
  kategori: ServiceCategory;
  baslik: string;
  aciklama: string;
  temelFiyat: number;
  aktif: boolean;
};

export async function saveService(input: ServiceInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.slug || !input.baslik) {
    return { ok: false, error: "Slug ve başlık zorunludur." };
  }
  const data = {
    slug: input.slug,
    kategori: input.kategori,
    baslik: input.baslik,
    aciklama: input.aciklama,
    temelFiyat: Math.max(0, Math.round(input.temelFiyat)),
    aktif: input.aktif,
  };
  try {
    if (input.id) {
      await db.service.update({ where: { id: input.id }, data });
    } else {
      await db.service.create({ data: { ...data, gorseller: [] } });
    }
  } catch {
    return { ok: false, error: "Bu slug zaten kullanımda olabilir." };
  }
  revalidatePath("/admin/hizmetler");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleService(
  id: string,
  aktif: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  await db.service.update({ where: { id }, data: { aktif } });
  revalidatePath("/admin/hizmetler");
  revalidatePath("/");
  return { ok: true };
}

export type CampaignInput = {
  id?: string;
  baslik: string;
  aciklama: string;
  indirimYuzde: number;
  aktif: boolean;
  serviceId?: string | null;
  baslangic?: string | null;
  bitis?: string | null;
};

export async function saveCampaign(input: CampaignInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.baslik) return { ok: false, error: "Başlık zorunludur." };

  const baslangic = input.baslangic ? new Date(input.baslangic) : null;
  const bitis = input.bitis ? new Date(input.bitis) : null;
  if (baslangic && bitis && bitis <= baslangic) {
    return { ok: false, error: "Bitiş tarihi başlangıçtan sonra olmalı." };
  }

  const data = {
    baslik: input.baslik,
    aciklama: input.aciklama,
    indirimYuzde: Math.min(100, Math.max(0, Math.round(input.indirimYuzde))),
    aktif: input.aktif,
    serviceId: input.serviceId || null,
    baslangic,
    bitis,
  };
  if (input.id) {
    await db.campaign.update({ where: { id: input.id }, data });
  } else {
    await db.campaign.create({ data });
  }
  revalidatePath("/admin/kampanyalar");
  revalidatePath("/firsatlar");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleCampaign(
  id: string,
  aktif: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  await db.campaign.update({ where: { id }, data: { aktif } });
  revalidatePath("/admin/kampanyalar");
  revalidatePath("/firsatlar");
  return { ok: true };
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.campaign.delete({ where: { id } });
  revalidatePath("/admin/kampanyalar");
  revalidatePath("/firsatlar");
  return { ok: true };
}
