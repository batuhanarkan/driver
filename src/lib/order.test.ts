import { describe, it, expect } from "vitest";
import { itemTotal, orderTotal, canTransition } from "./order";

describe("itemTotal", () => {
  it("fiyat * adet hesaplar", () => {
    expect(itemTotal({ birimFiyat: 2500, adet: 2 })).toBe(5000);
  });

  it("adet en az 1 kabul eder", () => {
    expect(itemTotal({ birimFiyat: 1000, adet: 0 })).toBe(1000);
  });
});

describe("orderTotal", () => {
  it("satırları toplar", () => {
    expect(
      orderTotal([
        { birimFiyat: 2500, adet: 1 },
        { birimFiyat: 1200, adet: 2 },
      ]),
    ).toBe(4900);
  });
});

describe("canTransition", () => {
  it("geçerli geçişe izin verir", () => {
    expect(canTransition("BEKLEMEDE", "ONAYLANDI")).toBe(true);
    expect(canTransition("ONAYLANDI", "DEVAM_EDIYOR")).toBe(true);
  });

  it("geçersiz geçişi reddeder", () => {
    expect(canTransition("BEKLEMEDE", "TAMAMLANDI")).toBe(false);
    expect(canTransition("TAMAMLANDI", "BEKLEMEDE")).toBe(false);
  });

  it("her durumdan iptal mümkün (terminal hariç)", () => {
    expect(canTransition("BEKLEMEDE", "IPTAL")).toBe(true);
    expect(canTransition("DEVAM_EDIYOR", "IPTAL")).toBe(true);
    expect(canTransition("IPTAL", "IPTAL")).toBe(false);
  });
});
