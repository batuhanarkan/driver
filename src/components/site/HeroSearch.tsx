"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ServiceIcon } from "@/components/site/ServiceIcon";

type Prov = { id: string; ad: string; slug: string };
type Svc = { id: string; slug: string; baslik: string; kategori: string };

const ICON: Record<string, string> = {
  CHAUFFEUR: "steering",
  TRANSFER: "route",
  TOUR: "compass",
  GUIDE: "book",
  GREETING: "sparkle",
};

const selectCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-cream outline-none transition focus:border-gold/60";

export function HeroSearch({
  provinces,
  services,
}: {
  provinces: Prov[];
  services: Svc[];
}) {
  const router = useRouter();
  const [ilSlug, setIlSlug] = useState(provinces[0]?.slug ?? "");
  const [serviceSlug, setServiceSlug] = useState(services[0]?.slug ?? "");
  const [tarih, setTarih] = useState("");
  const [durak, setDurak] = useState("0");

  const activeService = services.find((s) => s.slug === serviceSlug);
  const stopluHizmet =
    activeService?.kategori === "TRANSFER" ||
    activeService?.kategori === "CHAUFFEUR";

  function submit() {
    const p = new URLSearchParams();
    if (serviceSlug) p.set("hizmet", serviceSlug);
    if (ilSlug) p.set("il", ilSlug);
    if (tarih) p.set("tarih", tarih);
    if (stopluHizmet && durak !== "0") p.set("durak", durak);
    router.push(`/rezervasyon?${p.toString()}`);
  }

  if (services.length === 0) return null;

  return (
    <div className="lift rounded-[calc(var(--radius)+0.4rem)] border hairline bg-white/80 p-4 backdrop-blur-sm sm:p-5">
      {/* Hizmet sekmeleri */}
      <div className="flex flex-wrap gap-2">
        {services.map((s) => {
          const active = s.slug === serviceSlug;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setServiceSlug(s.slug)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-gold text-black"
                  : "border border-line text-cream/70 hover:border-gold/40 hover:text-cream"
              }`}
            >
              <ServiceIcon name={ICON[s.kategori] ?? "sparkle"} className="h-4 w-4" />
              {s.baslik}
            </button>
          );
        })}
      </div>

      {/* Arama satırı */}
      <div
        className={`mt-4 grid gap-3 md:items-end ${
          stopluHizmet
            ? "md:grid-cols-[1.1fr_1fr_0.8fr_auto]"
            : "md:grid-cols-[1.2fr_1fr_auto]"
        }`}
      >
        <Field label="Kalkış Yeri">
          <select
            value={ilSlug}
            onChange={(e) => setIlSlug(e.target.value)}
            className={selectCls}
          >
            {provinces.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.ad}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tarih">
          <input
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            className={selectCls}
          />
        </Field>

        {stopluHizmet && (
          <Field label="Durak">
            <select
              value={durak}
              onChange={(e) => setDurak(e.target.value)}
              className={selectCls}
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={String(n)}>
                  {n === 0 ? "Duraksız" : `${n} durak`}
                </option>
              ))}
            </select>
          </Field>
        )}

        <button
          onClick={submit}
          className="h-[50px] rounded-xl bg-gold px-7 font-semibold text-black shadow-[0_14px_44px_-14px_rgba(168,123,41,0.65)] transition hover:brightness-105"
        >
          Devam Et
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gold/80">
        {label}
      </span>
      {children}
    </label>
  );
}
