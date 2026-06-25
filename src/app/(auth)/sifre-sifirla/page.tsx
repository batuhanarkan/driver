import type { Metadata } from "next";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Şifremi Unuttum" };

export default function SifremiUnuttumPage() {
  return <ForgotForm />;
}
