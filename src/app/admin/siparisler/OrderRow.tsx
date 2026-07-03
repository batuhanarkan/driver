"use client";

import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { StatusBadge } from "@/components/admin/StatusBadge";

export function OrderRow({
  id,
  siparisNo,
  musteriAd,
  tutar,
  tarih,
  durum,
}: {
  id: string;
  siparisNo: string;
  musteriAd: string;
  tutar: string;
  tarih: string;
  durum: OrderStatus;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/admin/siparisler/${id}`)}
      className="cursor-pointer border-t hairline transition hover:bg-cream/[0.04]"
    >
      <td className="px-5 py-3 font-medium text-gold/90">{siparisNo}</td>
      <td className="px-5 py-3 text-cream/75">{musteriAd}</td>
      <td className="px-5 py-3 text-cream/75">{tutar}</td>
      <td className="px-5 py-3 text-cream/55">{tarih}</td>
      <td className="px-5 py-3">
        <StatusBadge durum={durum} />
      </td>
    </tr>
  );
}
