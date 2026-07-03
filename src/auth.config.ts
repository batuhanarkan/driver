import type { NextAuthConfig } from "next-auth";

// Edge-safe temel config: Prisma/bcrypt IMPORT ETMEZ.
// Ağır bağımlılıklar auth.ts'de. Admin erişimi admin/layout.tsx'te kontrol edilir.
export const authConfig = {
  // Giriş yalnızca /admin panelinden yapılır (inline form).
  pages: { signIn: "/admin" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      // Çıplak /admin: inline giriş formu render edilsin (sayfa kendini kapatır).
      if (path === "/admin") return true;
      // Tüm /admin alt yolları: yalnızca ADMIN.
      if (path.startsWith("/admin")) return auth?.user?.role === "ADMIN";
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "USER" | "ADMIN" | undefined;
        if (token.sub) session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
