import type { ReactNode } from "react";
import { cn } from "../lib/utils";

/** Section heading: h2 at 48px/600 in two lines at most, optional lead at 18px. No kicker above it. */
export default function SectionHeading({ title, description, align = "center", onDark = false, className }: { title: string; description?: ReactNode; align?: "center" | "left"; onDark?: boolean; className?: string }) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <h2 className={cn("text-[32px] leading-[1.1] sm:text-[40px] lg:text-[clamp(36px,5.2vh,48px)]", onDark ? "text-white" : "text-fg")}>{title}</h2>
      {description && <p className={cn("mt-4 text-[clamp(16px,2.1vh,18px)] leading-relaxed", onDark ? "text-white/80" : "text-muted")}>{description}</p>}
    </div>
  );
}
