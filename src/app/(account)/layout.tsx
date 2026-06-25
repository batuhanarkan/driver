import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="above flex-1">{children}</div>
      <Footer />
    </>
  );
}
