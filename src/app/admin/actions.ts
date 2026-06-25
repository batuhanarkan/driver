"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canTransition } from "@/lib/order";
import { hashPassword } from "@/lib/password";
import type { OrderStatus, ServiceCategory } from "@prisma/client";

export type ActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Yetkisiz erişim");
  }
  return session;
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

export type CityInput = {
  id?: string;
  ad: string;
  slug: string;
  aktif: boolean;
  siralama: number;
  serviceIds: string[];
};

export async function saveCity(input: CityInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.ad || !input.slug) return { ok: false, error: "Ad ve slug zorunlu." };
  const temel = {
    ad: input.ad,
    slug: input.slug,
    aktif: input.aktif,
    siralama: Math.round(input.siralama) || 0,
  };
  const rel = input.serviceIds.map((id) => ({ id }));
  try {
    if (input.id) {
      // update: 'set' ilişkiyi tamamen değiştirir
      await db.city.update({
        where: { id: input.id },
        data: { ...temel, services: { set: rel } },
      });
    } else {
      // create: 'connect' kullanılır ('set' create'te geçersiz)
      await db.city.create({
        data: { ...temel, services: { connect: rel } },
      });
    }
  } catch {
    return { ok: false, error: "Bu slug zaten kullanımda olabilir." };
  }
  revalidatePath("/admin/sehirler");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleCity(id: string, aktif: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.city.update({ where: { id }, data: { aktif } });
  revalidatePath("/admin/sehirler");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCity(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.city.delete({ where: { id } });
  revalidatePath("/admin/sehirler");
  revalidatePath("/");
  return { ok: true };
}

export type LocationInput = {
  id?: string;
  cityId: string;
  ad: string;
  tip: "HAVALIMANI" | "OTEL" | "SEMT" | "DIGER";
  aktif: boolean;
};

export async function saveLocation(input: LocationInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.ad) return { ok: false, error: "Lokasyon adı zorunlu." };
  const data = {
    cityId: input.cityId,
    ad: input.ad,
    tip: input.tip,
    aktif: input.aktif,
  };
  if (input.id) await db.location.update({ where: { id: input.id }, data });
  else await db.location.create({ data });
  revalidatePath("/admin/sehirler");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.location.delete({ where: { id } });
  revalidatePath("/admin/sehirler");
  revalidatePath("/");
  return { ok: true };
}

/* ─────────── Araçlar ─────────── */

export type VehicleInput = {
  id?: string;
  ad: string;
  sinif: "EKONOMI" | "BUSINESS" | "VAN" | "LUKS";
  kapasite: number;
  fiyat: number;
  aktif: boolean;
};

export async function saveVehicle(input: VehicleInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.ad) return { ok: false, error: "Araç adı zorunlu." };
  const data = {
    ad: input.ad,
    sinif: input.sinif,
    kapasite: Math.max(1, Math.round(input.kapasite) || 1),
    fiyat: Math.max(0, Math.round(input.fiyat) || 0),
    aktif: input.aktif,
  };
  if (input.id) await db.vehicle.update({ where: { id: input.id }, data });
  else await db.vehicle.create({ data });
  revalidatePath("/admin/araclar");
  revalidatePath("/rezervasyon");
  return { ok: true };
}

export async function toggleVehicle(
  id: string,
  aktif: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  await db.vehicle.update({ where: { id }, data: { aktif } });
  revalidatePath("/admin/araclar");
  revalidatePath("/rezervasyon");
  return { ok: true };
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.vehicle.delete({ where: { id } });
  } catch {
    return {
      ok: false,
      error: "Bu araç bir siparişte kullanılmış, silinemez. Pasife alabilirsiniz.",
    };
  }
  revalidatePath("/admin/araclar");
  revalidatePath("/rezervasyon");
  return { ok: true };
}

/* ─────────── Kullanıcılar ─────────── */

export type AdminUserInput = {
  ad: string;
  email: string;
  telefon?: string;
  sifre: string;
  rol: "USER" | "ADMIN";
};

export async function createUserByAdmin(
  input: AdminUserInput,
): Promise<ActionResult> {
  await requireAdmin();
  if (!input.ad || !input.email) return { ok: false, error: "Ad ve e-posta zorunlu." };
  if (!input.sifre || input.sifre.length < 6) {
    return { ok: false, error: "Şifre en az 6 karakter olmalı." };
  }
  const exists = await db.user.findUnique({ where: { email: input.email } });
  if (exists) return { ok: false, error: "Bu e-posta zaten kayıtlı." };

  await db.user.create({
    data: {
      ad: input.ad,
      email: input.email,
      telefon: input.telefon || null,
      sifreHash: await hashPassword(input.sifre),
      rol: input.rol,
    },
  });
  revalidatePath("/admin/kullanicilar");
  return { ok: true };
}

export async function setUserRole(
  id: string,
  rol: "USER" | "ADMIN",
): Promise<ActionResult> {
  await requireAdmin();
  if (rol === "USER") {
    const target = await db.user.findUnique({ where: { id } });
    if (target?.rol === "ADMIN") {
      const adminSayisi = await db.user.count({ where: { rol: "ADMIN" } });
      if (adminSayisi <= 1) {
        return { ok: false, error: "Son yöneticiyi düşüremezsiniz." };
      }
    }
  }
  await db.user.update({ where: { id }, data: { rol } });
  revalidatePath("/admin/kullanicilar");
  return { ok: true };
}

export async function deleteUserByAdmin(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.id === id) {
    return { ok: false, error: "Kendinizi silemezsiniz." };
  }
  const target = await db.user.findUnique({ where: { id } });
  if (target?.rol === "ADMIN") {
    const adminSayisi = await db.user.count({ where: { rol: "ADMIN" } });
    if (adminSayisi <= 1) {
      return { ok: false, error: "Son yöneticiyi silemezsiniz." };
    }
  }
  try {
    await db.user.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Bu kullanıcının siparişleri var, silinemez." };
  }
  revalidatePath("/admin/kullanicilar");
  return { ok: true };
}
