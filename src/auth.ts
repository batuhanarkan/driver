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
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;
        const ok = await verifyPassword(parsed.data.sifre, user.sifreHash);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.ad,
          email: user.email,
          role: user.rol,
        };
      },
    }),
  ],
});
