import type { NextAuthConfig } from "next-auth";

// Edge-safe temel config: Prisma/bcrypt IMPORT ETMEZ.
// middleware.ts bunu kullanır; ağır bağımlılıklar auth.ts'de.
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
      if (session.user) {
        session.user.role = token.role as "USER" | "ADMIN" | undefined;
        if (token.sub) session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
