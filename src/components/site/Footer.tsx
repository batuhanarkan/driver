import Link from "next/link";
import { Brand } from "./Brand";

const HIZMETLER = [
  { href: "/hizmetler/soforlu-arac", label: "Şoförlü Araç" },
  { href: "/hizmetler/transfer", label: "Transfer" },
  { href: "/hizmetler/turlar", label: "Turlar" },
  { href: "/hizmetler/ozel-rehberlik", label: "Özel Rehberlik" },
  { href: "/hizmetler/selamlama", label: "Selamlama" },
];

const KURUMSAL = [
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/kariyer", label: "Kariyer" },
  { href: "/firsatlar", label: "Fırsatlar" },
  { href: "/iletisim", label: "İletişim" },
];

const YASAL = [
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/sartlar", label: "Kullanım Şartları" },
];

function Column({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-sm uppercase tracking-[0.2em] text-gold/80">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="text-sm text-cream/60 transition hover:text-cream">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="above border-t hairline bg-ink-2/60">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/55">
              İstanbul'da ayrıcalıklı ulaşım. Şoförlü araç, transfer, tur ve VIP
              karşılama hizmetleri tek çatı altında.
            </p>
            <p className="mt-6 text-sm text-cream/50">
              Beşiktaş, İstanbul
              <br />
              +90 212 000 00 00
              <br />
              merhaba@vipdrive.com
            </p>
          </div>
          <Column title="Hizmetler" items={HIZMETLER} />
          <Column title="Kurumsal" items={KURUMSAL} />
          <Column title="Yasal" items={YASAL} />
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t hairline pt-6 text-xs text-cream/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} VipDrive. Tüm hakları saklıdır.</p>
          <p>İstanbul'un ayrıcalıklı ulaşım partneri.</p>
        </div>
      </div>
    </footer>
  );
}
