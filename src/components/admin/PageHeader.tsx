import type { ReactNode } from "react";

export function PageHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-cream">{title}</h1>
        {desc && <p className="mt-2 text-sm text-cream/55">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
