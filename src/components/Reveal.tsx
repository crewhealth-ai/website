import type { ReactNode } from "react";

/** Layout-only wrapper. Content is visible in its default state; the scene cross-fade is the page's one scrolled motion. */
export default function Reveal({ children, className }: { children: ReactNode; className?: string; delay?: number; y?: number; once?: boolean }) {
  return <div className={className}>{children}</div>;
}
