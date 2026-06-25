import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "./auth";

describe("registerSchema", () => {
  it("geçerli girdiyi kabul eder", () => {
    const r = registerSchema.safeParse({
      ad: "Ali Veli",
      email: "ali@test.com",
      telefon: "5551234567",
      sifre: "gizli123",
    });
    expect(r.success).toBe(true);
  });

  it("kısa şifreyi reddeder", () => {
    const r = registerSchema.safeParse({
      ad: "Ali",
      email: "ali@test.com",
      telefon: "5551234567",
      sifre: "123",
    });
    expect(r.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("geçersiz e-postayı reddeder", () => {
    const r = loginSchema.safeParse({ email: "bozuk", sifre: "x" });
    expect(r.success).toBe(false);
  });
});
