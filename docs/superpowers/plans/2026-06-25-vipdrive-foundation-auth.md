# VipDrive — Faz 1: Temel Altyapı & Kimlik Doğrulama (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js + TypeScript projesini kurmak, veritabanı şemasını oluşturmak ve e-posta/şifre ile rol bazlı (USER/ADMIN) kimlik doğrulamayı çalışır hale getirmek.

**Architecture:** Tek kod tabanlı Next.js 15 App Router uygulaması. Prisma + PostgreSQL veri katmanı, Auth.js v5 (JWT strateji) ile kimlik doğrulama. Edge-safe middleware ile rol bazlı route koruması (split-config deseni). Kritik iş mantığı (şifre hash, doğrulama) için TDD.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma 6, PostgreSQL, Auth.js v5 (next-auth@beta), bcryptjs, Zod, Vitest.

## Global Constraints

- Marka adı her yerde **VipDrive** — referans sitenin (Travelium/Bob the Driver) marka adı/metni asla kopyalanmaz.
- Dil: Sadece Türkçe (UI metinleri, hata mesajları Türkçe).
- Ödeme YOK — bu fazda ödeme ile ilgili hiçbir alan/kod yok.
- TypeScript `strict` modda.
- Şifreler asla düz metin saklanmaz; bcrypt ile hash.
- Veri modeli alan adları Türkçe (`ad`, `sifreHash`, `telefon`, `rol`); enum değerleri İngilizce büyük harf (`USER`, `ADMIN`, `CHAUFFEUR` ...).
- Path alias: `@/*` → `src/*`.
- Her task TDD döngüsüyle biter ve commit'lenir.

---

### Task 1: Proje iskeleti ve araç zinciri

**Files:**
- Create: tüm Next.js iskeleti (`package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`)
- Create: `vitest.config.ts`
- Create: `.env` (lokal), `.env.example`
- Modify: `package.json` (test script + bağımlılıklar)

**Interfaces:**
- Produces: Çalışan `npm run dev`, `npm run build`, `npm test` komutları. Path alias `@/*`.

- [ ] **Step 1: Next.js iskeletini oluştur**

Mevcut dizinin içine (boş `docs/` zaten var) scaffold et:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 2: Bağımlılıkları kur**

```bash
npm install @prisma/client next-auth@beta bcryptjs zod zustand
npm install -D prisma vitest @vitejs/plugin-react vite-tsconfig-paths @types/bcryptjs
```

- [ ] **Step 3: Vitest yapılandırması**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

Add to `package.json` "scripts": `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 4: Geçici sağlık testi yaz**

Create `src/lib/health.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("çalışıyor", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Testin geçtiğini doğrula**

Run: `npm test`
Expected: PASS (1 test). Ayrıca `npm run build` hatasız tamamlanmalı.

- [ ] **Step 6: Commit**

```bash
printf "\n# env\n.env\n" >> .gitignore
git add -A
git commit -m "chore: Next.js iskeleti + Vitest araç zinciri"
```

---

### Task 2: Veritabanı şeması (Prisma)

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Modify: `.env`, `.env.example` (DATABASE_URL)

**Interfaces:**
- Produces: `db` (PrismaClient singleton) `@/lib/db`'den export. Modeller: `User`, `Service`, `Vehicle`, `Order`, `OrderItem`, `Campaign`, `Lead`. Enumlar: `Role`, `ServiceCategory`, `VehicleClass`, `OrderStatus`, `LeadType`.

- [ ] **Step 1: Prisma şemasını yaz**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum ServiceCategory {
  CHAUFFEUR
  TRANSFER
  TOUR
  GUIDE
  GREETING
}

enum VehicleClass {
  EKONOMI
  BUSINESS
  VAN
  LUKS
}

enum OrderStatus {
  BEKLEMEDE
  ONAYLANDI
  DEVAM_EDIYOR
  TAMAMLANDI
  IPTAL
}

enum LeadType {
  ILETISIM
  KURUMSAL
  KARIYER
}

model User {
  id        String   @id @default(cuid())
  ad        String
  email     String   @unique
  sifreHash String
  telefon   String?
  rol       Role     @default(USER)
  orders    Order[]
  createdAt DateTime @default(now())
}

model Service {
  id          String          @id @default(cuid())
  slug        String          @unique
  kategori    ServiceCategory
  baslik      String
  aciklama    String
  kapakGorsel String?
  gorseller   String[]
  temelFiyat  Int
  aktif       Boolean         @default(true)
  orderItems  OrderItem[]
  createdAt   DateTime        @default(now())
}

model Vehicle {
  id         String       @id @default(cuid())
  ad         String
  sinif      VehicleClass
  kapasite   Int
  gorsel     String?
  fiyat      Int
  aktif      Boolean      @default(true)
  orderItems OrderItem[]
}

model Order {
  id          String      @id @default(cuid())
  siparisNo   String      @unique
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  durum       OrderStatus @default(BEKLEMEDE)
  toplamTutar Int
  not         String?
  items       OrderItem[]
  createdAt   DateTime    @default(now())
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  serviceId  String
  service    Service  @relation(fields: [serviceId], references: [id])
  vehicleId  String?
  vehicle    Vehicle? @relation(fields: [vehicleId], references: [id])
  detay      Json
  birimFiyat Int
  adet       Int      @default(1)
}

model Campaign {
  id           String  @id @default(cuid())
  baslik       String
  aciklama     String
  gorsel       String?
  indirimYuzde Int     @default(0)
  aktif        Boolean @default(true)
  createdAt    DateTime @default(now())
}

model Lead {
  id        String   @id @default(cuid())
  tip       LeadType
  ad        String
  email     String
  telefon   String?
  mesaj     String
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: DATABASE_URL ekle**

`.env` içine lokal PostgreSQL bağlantısı:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vipdrive?schema=public"
```

`.env.example` içine aynısını gizli değerler boş bırakarak ekle.

> Lokal Postgres yoksa: `docker run --name vipdrive-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vipdrive -p 5432:5432 -d postgres:16`

- [ ] **Step 3: Prisma client singleton yaz**

Create `src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 4: Migration çalıştır ve client üret**

Run: `npx prisma migrate dev --name init`
Expected: Migration uygulanır, `@prisma/client` üretilir, tablolar oluşur.

- [ ] **Step 5: Şema sağlamasını doğrula**

Run: `npx prisma validate`
Expected: "The schema is valid 🎉".

- [ ] **Step 6: Commit**

```bash
git add prisma src/lib/db.ts .env.example .gitignore
git commit -m "feat: Prisma şeması + DB client (User/Service/Order/...)"
```

---

### Task 3: Şifre yardımcıları (TDD)

**Files:**
- Create: `src/lib/password.ts`
- Test: `src/lib/password.test.ts`

**Interfaces:**
- Produces: `hashPassword(plain: string): Promise<string>`, `verifyPassword(plain: string, hash: string): Promise<boolean>`.

- [ ] **Step 1: Başarısız testi yaz**

Create `src/lib/password.test.ts`:

```ts
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
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/password.test.ts`
Expected: FAIL — "Failed to resolve import ./password".

- [ ] **Step 3: Minimal implementasyon**

Create `src/lib/password.ts`:

```ts
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Testin geçtiğini doğrula**

Run: `npx vitest run src/lib/password.test.ts`
Expected: PASS (2 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/password.ts src/lib/password.test.ts
git commit -m "feat: bcrypt şifre hash/verify yardımcıları"
```

---

### Task 4: Auth doğrulama şemaları (TDD)

**Files:**
- Create: `src/lib/validations/auth.ts`
- Test: `src/lib/validations/auth.test.ts`

**Interfaces:**
- Produces: `registerSchema`, `RegisterInput`, `loginSchema`, `LoginInput` (Zod). `registerSchema` alanları: `ad`, `email`, `telefon`, `sifre`. `loginSchema` alanları: `email`, `sifre`.

- [ ] **Step 1: Başarısız testi yaz**

Create `src/lib/validations/auth.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "./auth";

describe("registerSchema", () => {
  it("geçerli girdiyi kabul eder", () => {
    const r = registerSchema.safeParse({
      ad: "Ali Veli", email: "ali@test.com", telefon: "5551234567", sifre: "gizli123",
    });
    expect(r.success).toBe(true);
  });

  it("kısa şifreyi reddeder", () => {
    const r = registerSchema.safeParse({
      ad: "Ali", email: "ali@test.com", telefon: "5551234567", sifre: "123",
    });
    expect(r.success).toBe(false);
  });

  it("geçersiz e-postayı reddeder", () => {
    const r = loginSchema.safeParse({ email: "bozuk", sifre: "x" });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run src/lib/validations/auth.test.ts`
Expected: FAIL — import çözülemez.

- [ ] **Step 3: Minimal implementasyon**

Create `src/lib/validations/auth.ts`:

```ts
import { z } from "zod";

export const registerSchema = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  telefon: z.string().min(10, "Geçerli bir telefon girin"),
  sifre: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  sifre: z.string().min(1, "Şifre gerekli"),
});
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 4: Testin geçtiğini doğrula**

Run: `npx vitest run src/lib/validations/auth.test.ts`
Expected: PASS (3 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/auth.ts src/lib/validations/auth.test.ts
git commit -m "feat: kayıt/giriş için Zod doğrulama şemaları"
```

---

### Task 5: Auth.js yapılandırması (split-config)

**Files:**
- Create: `src/types/next-auth.d.ts`
- Create: `src/auth.config.ts`
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `.env` (AUTH_SECRET)

**Interfaces:**
- Consumes: `db` (`@/lib/db`), `verifyPassword` (`@/lib/password`), `loginSchema` (`@/lib/validations/auth`).
- Produces: `handlers`, `auth`, `signIn`, `signOut` (`@/auth`). `authConfig` (`@/auth.config`). Session/JWT `user.role: "USER" | "ADMIN"`.

- [ ] **Step 1: Tip genişletmesi (module augmentation)**

Create `src/types/next-auth.d.ts`:

```ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "USER" | "ADMIN";
  }
  interface Session {
    user: { role?: "USER" | "ADMIN" } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
  }
}
```

- [ ] **Step 2: Edge-safe temel config**

Create `src/auth.config.ts` (Prisma/bcrypt import ETMEZ — middleware'de kullanılacak):

```ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/giris" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;
      if (path.startsWith("/admin")) return isLoggedIn && role === "ADMIN";
      if (path.startsWith("/hesabim")) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
```

- [ ] **Step 3: Tam auth (Credentials + authorize)**

Create `src/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, sifre: {} },
      authorize: async (creds) => {
        const parsed = loginSchema.safeParse(creds);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user) return null;
        const ok = await verifyPassword(parsed.data.sifre, user.sifreHash);
        if (!ok) return null;
        return { id: user.id, name: user.ad, email: user.email, role: user.rol };
      },
    }),
  ],
});
```

- [ ] **Step 4: Route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 5: AUTH_SECRET üret**

Run: `npx auth secret` (veya `openssl rand -base64 32` çıktısını `.env` içine `AUTH_SECRET=` olarak ekle). `.env.example`'a boş `AUTH_SECRET=` satırı ekle.

- [ ] **Step 6: Derlemeyi doğrula**

Run: `npm run build`
Expected: Hatasız derlenir (auth route'ları tanınır).

- [ ] **Step 7: Commit**

```bash
git add src/auth.ts src/auth.config.ts src/types "src/app/api/auth" .env.example
git commit -m "feat: Auth.js v5 split-config (Credentials + rol)"
```

---

### Task 6: Rol bazlı middleware koruması

**Files:**
- Create: `src/middleware.ts`

**Interfaces:**
- Consumes: `authConfig` (`@/auth.config`).
- Produces: `/admin/*` sadece ADMIN; `/hesabim/*` giriş gerektirir; aksi halde `/giris`'e yönlendirme.

- [ ] **Step 1: Middleware yaz**

Create `src/middleware.ts`:

```ts
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/hesabim/:path*"],
};
```

- [ ] **Step 2: Derlemeyi doğrula**

Run: `npm run build`
Expected: Hatasız. (Middleware edge'de çalışır; `authConfig` Prisma import etmediği için sorun olmaz.)

- [ ] **Step 3: Manuel doğrulama (geçici)**

`npm run dev` → giriş yapmadan `/admin` ve `/hesabim`'a gidince `/giris`'e yönlendirilmeli. (Sayfalar Task 7-9'da gelecek; şimdilik 404 yerine yönlendirme davranışı için bu task'tan sonra Task 9'da tam doğrulanır.)

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: rol bazlı route koruması (middleware)"
```

---

### Task 7: Kayıt (register) — server action + sayfa

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/actions.ts`
- Create: `src/app/(auth)/kayit/page.tsx`
- Create: `src/app/(auth)/kayit/RegisterForm.tsx`

**Interfaces:**
- Consumes: `registerSchema` (`@/lib/validations/auth`), `db`, `hashPassword`.
- Produces: `registerUser(_prev, formData): Promise<{ ok: boolean; error?: string }>` (`@/app/(auth)/actions`).

- [ ] **Step 1: Auth layout**

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
```

- [ ] **Step 2: Register server action**

Create `src/app/(auth)/actions.ts`:

```ts
"use server";

import { registerSchema } from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export type ActionState = { ok: boolean; error?: string };

export async function registerUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    ad: formData.get("ad"),
    email: formData.get("email"),
    telefon: formData.get("telefon"),
    sifre: formData.get("sifre"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { ok: false, error: "Bu e-posta zaten kayıtlı" };

  await db.user.create({
    data: {
      ad: parsed.data.ad,
      email: parsed.data.email,
      telefon: parsed.data.telefon,
      sifreHash: await hashPassword(parsed.data.sifre),
      rol: "USER",
    },
  });
  return { ok: true };
}
```

- [ ] **Step 3: Register form (client)**

Create `src/app/(auth)/kayit/RegisterForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { registerUser, type ActionState } from "../actions";

const initial: ActionState = { ok: false };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerUser, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/giris?kayit=basarili");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-4">
      <h1 className="text-2xl font-semibold">Kayıt Ol</h1>
      {state.error && <p className="text-red-400 text-sm">{state.error}</p>}
      <input name="ad" placeholder="Ad Soyad" className="w-full rounded bg-neutral-900 p-3" />
      <input name="email" type="email" placeholder="E-posta" className="w-full rounded bg-neutral-900 p-3" />
      <input name="telefon" placeholder="Telefon" className="w-full rounded bg-neutral-900 p-3" />
      <input name="sifre" type="password" placeholder="Şifre" className="w-full rounded bg-neutral-900 p-3" />
      <button disabled={pending} className="w-full rounded bg-amber-500 p-3 font-medium text-black disabled:opacity-50">
        {pending ? "Kaydediliyor..." : "Kayıt Ol"}
      </button>
      <a href="/giris" className="block text-center text-sm text-neutral-400">Zaten hesabın var mı? Giriş yap</a>
    </form>
  );
}
```

- [ ] **Step 4: Register sayfası**

Create `src/app/(auth)/kayit/page.tsx`:

```tsx
import { RegisterForm } from "./RegisterForm";

export default function KayitPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 5: Manuel doğrulama**

Run: `npm run dev` → `/kayit` doldur → kayıt → `/giris?kayit=basarili`'ye yönlenir. `npx prisma studio` ile `User` tablosunda kayıt görünür, `sifreHash` hash'li.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(auth)"
git commit -m "feat: kullanıcı kayıt (server action + form)"
```

---

### Task 8: Giriş (login) sayfası

**Files:**
- Create: `src/app/(auth)/giris/page.tsx`
- Create: `src/app/(auth)/giris/LoginForm.tsx`

**Interfaces:**
- Consumes: `signIn` (Auth.js, client `next-auth/react`).
- Produces: Giriş sonrası `/hesabim`'a yönlendirme.

- [ ] **Step 1: Login form (client)**

Create `src/app/(auth)/giris/LoginForm.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ kayitBasarili }: { kayitBasarili: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      sifre: fd.get("sifre"),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("E-posta veya şifre hatalı");
      return;
    }
    router.push("/hesabim");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Giriş Yap</h1>
      {kayitBasarili && <p className="text-green-400 text-sm">Kayıt başarılı, giriş yapabilirsin.</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <input name="email" type="email" placeholder="E-posta" className="w-full rounded bg-neutral-900 p-3" />
      <input name="sifre" type="password" placeholder="Şifre" className="w-full rounded bg-neutral-900 p-3" />
      <button disabled={pending} className="w-full rounded bg-amber-500 p-3 font-medium text-black disabled:opacity-50">
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
      <a href="/kayit" className="block text-center text-sm text-neutral-400">Hesabın yok mu? Kayıt ol</a>
    </form>
  );
}
```

- [ ] **Step 2: Login sayfası**

Create `src/app/(auth)/giris/page.tsx`:

```tsx
import { LoginForm } from "./LoginForm";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ kayit?: string }>;
}) {
  const sp = await searchParams;
  return <LoginForm kayitBasarili={sp.kayit === "basarili"} />;
}
```

- [ ] **Step 3: Manuel doğrulama**

`/giris` → Task 7'de oluşturduğun kullanıcı ile giriş → `/hesabim`'a yönlenir (sayfa Task 9'da gelecek). Yanlış şifre → "E-posta veya şifre hatalı".

- [ ] **Step 4: Commit**

```bash
git add "src/app/(auth)/giris"
git commit -m "feat: giriş sayfası (Auth.js credentials)"
```

---

### Task 9: Hesap sayfası + oturum kapatma + seed (uçtan uca doğrulama)

**Files:**
- Create: `src/app/(account)/hesabim/page.tsx`
- Create: `src/app/(account)/hesabim/SignOutButton.tsx`
- Create: `prisma/seed.ts`
- Modify: `package.json` (prisma.seed + tsx)

**Interfaces:**
- Consumes: `auth` (`@/auth`), `signOut` (client).
- Produces: Çalışan uçtan uca akış: kayıt → giriş → hesabım; admin seed kullanıcısı.

- [ ] **Step 1: SignOut butonu**

Create `src/app/(account)/hesabim/SignOutButton.tsx`:

```tsx
"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded bg-neutral-800 px-4 py-2 text-sm text-white"
    >
      Çıkış Yap
    </button>
  );
}
```

- [ ] **Step 2: Hesap sayfası**

Create `src/app/(account)/hesabim/page.tsx`:

```tsx
import { auth } from "@/auth";
import { SignOutButton } from "./SignOutButton";

export default async function HesabimPage() {
  const session = await auth();
  return (
    <main className="min-h-screen bg-neutral-950 p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Hesabım</h1>
        <p className="text-neutral-300">Merhaba, {session?.user?.name}</p>
        <p className="text-neutral-500 text-sm">Rol: {session?.user?.role}</p>
        <SignOutButton />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Seed scripti (admin + örnek hizmetler)**

Install: `npm install -D tsx`

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = "admin@vipdrive.com";
  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      ad: "VipDrive Admin",
      email: adminEmail,
      sifreHash: await bcrypt.hash("admin123", 10),
      rol: "ADMIN",
    },
  });

  const hizmetler = [
    { slug: "soforlu-arac", kategori: "CHAUFFEUR", baslik: "Şoförlü Araç", aciklama: "Profesyonel şoför eşliğinde özel araç.", temelFiyat: 2500 },
    { slug: "transfer", kategori: "TRANSFER", baslik: "Transfer", aciklama: "Havalimanı ve otel transferleri.", temelFiyat: 1200 },
    { slug: "turlar", kategori: "TOUR", baslik: "Turlar", aciklama: "Rehberli şehir ve bölge turları.", temelFiyat: 3500 },
    { slug: "ozel-rehberlik", kategori: "GUIDE", baslik: "Özel Rehberlik", aciklama: "Uzman rehber hizmeti.", temelFiyat: 1800 },
    { slug: "selamlama", kategori: "GREETING", baslik: "Selamlama ve Karşılama", aciklama: "Havalimanı karşılama ve VIP yönlendirme.", temelFiyat: 900 },
  ] as const;

  for (const h of hizmetler) {
    await db.service.upsert({
      where: { slug: h.slug },
      update: {},
      create: { ...h, gorseller: [] },
    });
  }

  console.log("Seed tamamlandı: 1 admin + 5 hizmet");
}

main().finally(() => db.$disconnect());
```

`package.json`'a ekle:

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

- [ ] **Step 4: Seed çalıştır**

Run: `npx prisma db seed`
Expected: "Seed tamamlandı: 1 admin + 5 hizmet".

- [ ] **Step 5: Uçtan uca manuel doğrulama**

`npm run dev`:
- Yeni kullanıcı kayıt → giriş → `/hesabim` (Rol: USER görünür).
- `admin@vipdrive.com / admin123` ile giriş → `/admin`'e gidince yönlendirme YOK (ADMIN). USER ile `/admin` → `/giris`'e yönlenir.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(account)" prisma/seed.ts package.json
git commit -m "feat: hesap sayfası + çıkış + seed (admin & hizmetler)"
```

---

## Self-Review (yazar kontrolü)

- **Spec kapsamı (Faz 1 dilimi):** Stack (Task 1) ✓, veri modeli (Task 2) ✓, bcrypt (Task 3) ✓, e-posta/şifre auth (Task 4-8) ✓, rol koruması (Task 6) ✓, seed admin (Task 9) ✓. Web sayfaları/sipariş akışı ve admin ekranları Faz 2-3'e bırakıldı (bilinçli kapsam).
- **Placeholder taraması:** TBD/TODO yok; her kod adımı tam kod içerir.
- **Tip tutarlılığı:** `sifreHash`, `rol`, `role` ("USER"|"ADMIN") tüm task'larda tutarlı; `ActionState` tipi Task 7'de tanımlanıp form'da kullanılır; `registerSchema`/`loginSchema` alan adları (`ad/email/telefon/sifre`) action ve testlerle eşleşir.

---

## Sonraki Fazlar (yol haritası — ayrı planlar olarak yazılacak)

**Faz 2 — Web sitesi & Sipariş akışı:**
Web layout (üst menü + footer), ana sayfa (hero + arama + hizmet kartları + fırsatlar), `/hizmetler/[kategori]`, çok adımlı `/rezervasyon`, Zustand sepet, `/sepet`, `createOrder` server action (Order + OrderItem), `/hesabim` siparişlerim, `/firsatlar`, `/kurumsal` `/kariyer` `/iletisim` (Lead), yasal sayfalar. Playwright e2e: kayıt → sipariş → DB.

**Faz 3 — Admin panel:**
Admin sidebar layout, dashboard istatistikleri, `/admin/siparisler` (+detay, durum geçişleri), `/admin/hizmetler` CRUD, `/admin/kampanyalar` CRUD, `/admin/kullanicilar`, `/admin/talepler` (Lead), `/admin/raporlar`.

Her faz tamamlanınca bir sonraki plan `writing-plans` ile yazılır.
