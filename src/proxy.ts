import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware: /admin alt yollarını korur.
// Çıplak /admin (giriş formu) authorized() içinde serbest bırakılır → döngü yok.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
