import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { sections } from "../App";
import { cn } from "../lib/utils";

/** A single thin line down the left edge with a dot per section. The line fills as the page scrolls; the current dot glows. */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      const mid = window.scrollY + window.innerHeight * 0.4;
      let idx = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= mid) idx = i;
      });
      setActive(idx);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <nav
      className="pointer-events-none fixed top-24 bottom-10 left-[max(14px,calc((100vw-80rem)/2-28px))] z-40 hidden w-8 lg:block"
      aria-label="Page progress"
    >
      <div className="relative mx-auto h-full w-px bg-line">
        <motion.div style={{ scaleY: reduce ? scrollYProgress : fill }} className="absolute inset-0 origin-top bg-primary" />
        {sections.map((s, i) => {
          const top = `${(i / (sections.length - 1)) * 100}%`;
          const on = i === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-label={s.label}
              aria-current={on ? "location" : undefined}
              className="group pointer-events-auto absolute left-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              style={{ top }}
            >
              <span className={cn("block rounded-full transition-all duration-300", on ? "h-2.5 w-2.5 bg-primary ring-4 ring-primary/15" : "h-1.5 w-1.5 bg-line-strong group-hover:bg-primary")} />
            </a>
          );
        })}
      </div>
    </nav>
  );
}
