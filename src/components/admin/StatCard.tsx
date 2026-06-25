export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[var(--radius)] border hairline bg-surface/40 p-6">
      <p className="text-sm text-cream/55">{label}</p>
      <p className="mt-2 font-display text-3xl text-cream">{value}</p>
      {hint && <p className="mt-1 text-xs text-cream/40">{hint}</p>}
    </div>
  );
}
