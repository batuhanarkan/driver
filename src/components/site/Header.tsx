import Link from "next/link";
import { auth } from "@/auth";
import { Brand } from "./Brand";
import { CartButton } from "./CartButton";
import { MobileMenu } from "./MobileMenu";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/#hizmetler", label: "Hizmetler" },
  { href: "/firsatlar", label: "Fırsatlar" },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/kariyer", label: "Kariyer" },
  { href: "/iletisim", label: "İletişim" },
];

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="above sticky top-0 z-50 border-b hairline bg-ink/70 backdrop-blur-xl">
      <div className="container-px mx-auto flex h-20 max-w-7xl items-center justify-between">
        <Brand />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-cream/70 transition hover:text-gold"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartButton />
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              {user.role === "ADMIN" && (
                <Button href="/admin" variant="outline">
                  Panel
                </Button>
              )}
              <Button href="/hesabim" variant="ghost">
                Hesabım
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button href="/giris" variant="ghost">
                Giriş
              </Button>
              <Button href="/kayit">Üye Ol</Button>
            </div>
          )}
          <MobileMenu nav={NAV} isLoggedIn={!!user} isAdmin={user?.role === "ADMIN"} />
        </div>
      </div>
    </header>
  );
}
