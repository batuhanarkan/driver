import type { OrderStatus } from "@prisma/client";
import { STATUS_LABEL, STATUS_STYLE } from "@/lib/order";

export function StatusBadge({ durum }: { durum: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLE[durum]}`}
    >
      {STATUS_LABEL[durum]}
    </span>
  );
}
