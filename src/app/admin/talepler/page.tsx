import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import type { LeadType } from "@prisma/client";

const LEAD_LABEL: Record<LeadType, string> = {
  ILETISIM: "İletişim",
  KURUMSAL: "Kurumsal",
  KARIYER: "Kariyer",
};

const LEAD_STYLE: Record<LeadType, string> = {
  ILETISIM: "border-sky-500/30 bg-sky-500/15 text-sky-700",
  KURUMSAL: "border-gold/30 bg-gold/15 text-gold-2",
  KARIYER: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700",
};

const TYPES = Object.keys(LEAD_LABEL) as LeadType[];

export default async function TaleplerPage({
  searchParams,
}: {
  searchParams: Promise<{ tip?: string }>;
}) {
  const { tip: raw } = await searchParams;
  const tip = TYPES.includes(raw as LeadType) ? (raw as LeadType) : undefined;

  const talepler = await db.lead.findMany({
    where: tip ? { tip } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Talepler"
        desc="İletişim, kurumsal ve kariyer başvuruları."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip href="/admin/talepler" active={!tip}>
          Tümü
        </FilterChip>
        {TYPES.map((t) => (
          <FilterChip
            key={t}
            href={`/admin/talepler?tip=${t}`}
            active={tip === t}
          >
            {LEAD_LABEL[t]}
          </FilterChip>
        ))}
      </div>

      {talepler.length === 0 ? (
        <p className="rounded-[var(--radius)] border hairline bg-surface/30 p-12 text-center text-cream/50">
          {tip
            ? `${LEAD_LABEL[tip]} başvurusu bulunmuyor.`
            : "Henüz talep yok."}
        </p>
      ) : (
        <div className="grid gap-4">
          {talepler.map((l) => (
            <article
              key={l.id}
              className="rounded-[var(--radius)] border hairline bg-surface/40 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${LEAD_STYLE[l.tip]}`}
                  >
                    {LEAD_LABEL[l.tip]}
                  </span>
                  <h3 className="font-display text-lg text-cream">{l.ad}</h3>
                </div>
                <span className="text-xs text-cream/45">
                  {formatDate(l.createdAt)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-cream/65">
                <a
                  href={`mailto:${l.email}`}
                  className="text-gold/80 transition hover:text-gold"
                >
                  {l.email}
                </a>
                {l.telefon && (
                  <a
                    href={`tel:${l.telefon}`}
                    className="transition hover:text-cream"
                  >
                    {l.telefon}
                  </a>
                )}
              </div>

              <p className="mt-4 whitespace-pre-line border-t hairline pt-4 text-sm leading-relaxed text-cream/75">
                {l.mesaj}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full border border-gold bg-gold px-4 py-1.5 text-sm font-medium text-ink"
          : "rounded-full border hairline px-4 py-1.5 text-sm text-cream/60 transition hover:border-gold/40 hover:text-cream"
      }
    >
      {children}
    </Link>
  );
}
