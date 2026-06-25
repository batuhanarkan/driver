import { z } from "zod";

export const registerSchema = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.email("Geçerli bir e-posta girin"),
  telefon: z.string().min(10, "Geçerli bir telefon girin"),
  sifre: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta girin"),
  sifre: z.string().min(1, "Şifre gerekli"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const requestResetSchema = z.object({
  email: z.email("Geçerli bir e-posta girin"),
});

export const resetPasswordSchema = z.object({
  sifre: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});
