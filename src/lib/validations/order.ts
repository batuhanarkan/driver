import { z } from "zod";

export const orderItemSchema = z.object({
  serviceId: z.string().min(1),
  vehicleId: z.string().optional(),
  detay: z.record(z.string(), z.union([z.string(), z.number()])),
  adet: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  musteriAd: z.string().min(2, "Ad soyad girin"),
  musteriEmail: z.email("Geçerli bir e-posta girin"),
  musteriTelefon: z.string().min(10, "Geçerli bir telefon girin"),
  items: z.array(orderItemSchema).min(1, "Sepetiniz boş"),
  not: z.string().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
