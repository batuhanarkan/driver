import { z } from "zod";

export const leadSchema = z.object({
  tip: z.enum(["ILETISIM", "KURUMSAL", "KARIYER"]),
  ad: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.email("Geçerli bir e-posta girin"),
  telefon: z
    .string()
    .min(10, "Geçerli bir telefon girin")
    .optional()
    .or(z.literal("")),
  mesaj: z.string().min(5, "Mesaj en az 5 karakter olmalı"),
});

export type LeadInput = z.infer<typeof leadSchema>;
