import { cn } from "../lib/utils";

/** The CrewHealth mark: a crew of three, one of them in the accent. */
export function Mark({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const tile = onDark ? "#ffffff" : "var(--color-primary)";
  const head = onDark ? "var(--color-primary-900)" : "#ffffff";
  const lead = onDark ? "var(--color-primary)" : "var(--color-logo-dot)";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill={tile} />
      <circle cx="22" cy="38" r="10" fill={head} stroke={tile} strokeWidth="3" />
      <circle cx="42" cy="38" r="10" fill={head} stroke={tile} strokeWidth="3" />
      <circle cx="32" cy="24" r="10" fill={lead} stroke={tile} strokeWidth="3" />
    </svg>
  );
}

export default function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <a href="#top" className={cn("flex items-center gap-2.5", className)} aria-label="CrewHealth.AI home">
      <Mark onDark={onDark} className="h-8 w-8" />
      <span className={cn("font-heading text-[19px] font-semibold tracking-[-0.02em]", onDark ? "text-white" : "text-fg")}>
        CrewHealth<span className={onDark ? "text-white/70" : "text-primary"}>.AI</span>
      </span>
    </a>
  );
}
