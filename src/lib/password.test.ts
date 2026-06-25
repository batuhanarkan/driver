import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("hash düz metinden farklıdır ve doğru şifreyi doğrular", async () => {
    const hash = await hashPassword("gizli123");
    expect(hash).not.toBe("gizli123");
    expect(await verifyPassword("gizli123", hash)).toBe(true);
  });

  it("yanlış şifreyi reddeder", async () => {
    const hash = await hashPassword("gizli123");
    expect(await verifyPassword("yanlis", hash)).toBe(false);
  });
});
