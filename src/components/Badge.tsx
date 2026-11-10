import type { ReactNode } from "react";
import { cn } from "../lib/utils";

const tones = {
  slate: "bg-surface-2 text-muted",
  blue: "bg-primary-soft text-primary-700",
  green: "bg-accent-soft text-accent-700",
  amber: "bg-amber-soft text-amber",
};

/** Small sentence-case label. 13px/500, never tracked capitals. */
export default function Badge({ children, tone = "slate", className }: { children: ReactNode; tone?: keyof typeof tones; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium leading-none", tones[tone], className)}>
      {children}
    </span>
  );
}
