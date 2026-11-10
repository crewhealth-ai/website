import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useDesktop } from "../lib/useDesktop";

/**
 * A single thin line down the left edge that fills as the page scrolls: a quiet cue that there is more
 * below. No dots, labels or percentages. Decorative, since the header carries the section links.
 * Desktop only: on smaller screens it renders nothing.
 */
export default function ScrollProgress() {
  const desktop = useDesktop();
  return desktop ? <Rail /> : null;
}

function Rail() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-24 bottom-10 left-[max(14px,calc((100vw-80rem)/2-28px))] z-40 w-8"
    >
      <div className="relative mx-auto h-full w-px bg-line-strong">
        <motion.div style={{ scaleY: reduce ? scrollYProgress : fill }} className="absolute inset-0 origin-top bg-primary" />
      </div>
    </div>
  );
}
