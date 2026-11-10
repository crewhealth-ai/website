import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { sections } from "../lib/sections";
import { useDesktop } from "../lib/useDesktop";
import { cn } from "../lib/utils";

/**
 * A single thin line down the left edge with a dot where each section starts. The line fills as the
 * page scrolls, so it reaches a dot exactly when its section arrives; passed dots fill, the current one glows.
 * Desktop only: on smaller screens it renders nothing and listens to nothing.
 */
export default function ScrollProgress() {
  const desktop = useDesktop();
  return desktop ? <Rail /> : null;
}

function Rail() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const [stops, setStops] = useState<number[]>(() => sections.map((_, i) => i / (sections.length - 1)));
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Section offsets are read when the layout changes, never inside the scroll handler.
    let tops: number[] = [];
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      tops = sections.map((s) => document.getElementById(s.id)?.offsetTop ?? 0);
      setStops(tops.map((t) => Math.min(1, t / max)));
      update();
    };
    const update = () => {
      const mid = window.scrollY + window.innerHeight * 0.4;
      let idx = 0;
      tops.forEach((t, i) => {
        if (t <= mid) idx = i;
      });
      setActive(idx);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <nav
      className="pointer-events-none fixed top-24 bottom-10 left-[max(14px,calc((100vw-80rem)/2-28px))] z-40 w-8"
      aria-label="Page progress"
    >
      <div className="relative mx-auto h-full w-px bg-line-strong">
        <motion.div style={{ scaleY: reduce ? scrollYProgress : fill }} className="absolute inset-0 origin-top bg-primary" />
        {sections.map((s, i) => {
          const on = i === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-label={s.label}
              aria-current={on ? "location" : undefined}
              className="group pointer-events-auto absolute left-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              style={{ top: `${stops[i] * 100}%` }}
            >
              <span
                className={cn(
                  "block h-2.5 w-2.5 rounded-full transition-[transform,background-color,box-shadow] duration-300",
                  on ? "scale-100 bg-primary ring-4 ring-primary/15" : i < active ? "scale-[0.7] bg-primary" : "scale-[0.7] bg-subtle group-hover:bg-primary",
                )}
              />
            </a>
          );
        })}
      </div>
    </nav>
  );
}
