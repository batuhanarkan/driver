import { cn } from "@/lib/cn";

const paths: Record<string, ReactNodePath> = {
  steering: ["M12 21a9 9 0 100-18 9 9 0 000 18z", "M12 12a9 9 0 00-8.5 6M12 12a9 9 0 018.5 6M12 12V3"],
  route: ["M6 19a2 2 0 100-4 2 2 0 000 4z", "M18 9a2 2 0 100-4 2 2 0 000 4z", "M6 17V9a4 4 0 014-4h4"],
  compass: ["M12 22a10 10 0 100-20 10 10 0 000 20z", "M16 8l-2 6-6 2 2-6 6-2z"],
  book: ["M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5z", "M18 17H6a2 2 0 00-2 2"],
  sparkle: ["M12 3l1.8 4.9L19 9.6l-4.4 2.4L12 17l-2.6-5L5 9.6l5.2-1.7L12 3z"],
};

type ReactNodePath = string[];

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const d = paths[name] ?? paths.sparkle;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      aria-hidden
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}
