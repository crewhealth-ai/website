import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { usePinnable } from "../lib/useDesktop";
import { cn } from "../lib/utils";

/**
 * Scene engine. A pinned scene is a tall section whose content sticks for one
 * viewport: it fades in as it arrives, holds, then fades out as it leaves, so
 * consecutive scenes cross-fade. This is the page's one scroll-driven motion;
 * content inside a scene is visible in its default state.
 */

export const SceneContext = createContext<boolean | null>(null);

export function useSceneActive() {
  return useContext(SceneContext);
}

export type FadeOptions = { exitFade?: boolean; enterSlide?: boolean };

export function useSceneFade(ref: RefObject<HTMLElement | null>, heightVh: number, pinned: boolean, opts: FadeOptions = {}) {
  const { exitFade = true, enterSlide = true } = opts;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const unit = 100 / (heightVh + 100);
  // The scene is fully in 8vh (about the header height) before its top reaches the viewport top,
  // so an anchor jump that lands under the fixed header shows a crisp scene, not the tail of the ramp.
  const enter = unit * 0.92;
  const exit = heightVh / (heightVh + 100);
  const a = enter - 0.55 * unit;
  const b = exit + 0.55 * unit;

  const pts = pinned ? [a, enter, exit, b] : [0, 0.1, 0.9, 1];
  const out = pinned && exitFade;
  const slideIn = pinned && enterSlide;
  const opacity = useTransform(scrollYProgress, pts, pinned ? [0, 1, 1, out ? 0 : 1] : [1, 1, 1, 1]);
  const y = useTransform(scrollYProgress, pts, pinned ? [slideIn ? "-47vh" : "0vh", "0vh", "0vh", out ? "47vh" : "0vh"] : ["0vh", "0vh", "0vh", "0vh"]);
  const scale = useTransform(scrollYProgress, pts, pinned ? [slideIn ? 0.96 : 1, 1, 1, out ? 1.03 : 1] : [1, 1, 1, 1]);
  const blurPx = useTransform(scrollYProgress, pts, pinned ? [10, 0, 0, out ? 10 : 0] : [0, 0, 0, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  const [active, setActive] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const on = pinned ? v > a - 0.1 * unit && v < b : v > 0.04 && v < 1;
    if (on !== active) setActive(on);
  });

  return { scrollYProgress, opacity, y, scale, filter, active, enter, exit, unit };
}

/** Scales its content down when it would be taller than the viewport minus the nav, so a pinned scene is never clipped. */
export function FitToViewport({ enabled, children, reserve = 104, className }: { enabled: boolean; children: ReactNode; reserve?: number; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!enabled) {
      setScale(1);
      setHeight(undefined);
      return;
    }
    const measure = () => {
      const el = inner.current;
      if (!el) return;
      const natural = el.offsetHeight;
      const avail = window.innerHeight - reserve;
      const s = natural > 0 ? Math.min(1, avail / natural) : 1;
      setScale(s);
      setHeight(s < 1 ? natural * s : undefined);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (inner.current) ro.observe(inner.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled, reserve]);

  return (
    <div className={className} style={{ height }}>
      <div ref={inner} style={scale < 1 ? { transform: `scale(${scale})`, transformOrigin: "top center" } : undefined}>
        {children}
      </div>
    </div>
  );
}

const surfaces = { base: "bg-transparent", white: "bg-transparent", dark: "bg-primary-900 bg-grid-on-dark" } as const;

export default function Scene({
  id,
  children,
  height = 160,
  mode = "pinned",
  surface = "base",
  className,
  contentClassName,
  align = "center",
  exitFade = true,
  enterSlide = true,
}: {
  id?: string;
  children: ReactNode | ((p: { progress: MotionValue<number>; enter: number; exit: number }) => ReactNode);
  height?: number;
  mode?: "pinned" | "flow";
  surface?: keyof typeof surfaces;
  className?: string;
  contentClassName?: string;
  align?: "center" | "start";
  exitFade?: boolean;
  enterSlide?: boolean;
}) {
  const pinnable = usePinnable();
  const reduce = useReducedMotion();
  const pinned = mode === "pinned" && pinnable && !reduce;
  const ref = useRef<HTMLElement>(null);
  const fade = useSceneFade(ref, height, pinned, { exitFade, enterSlide });

  const style = pinned && !reduce ? { opacity: fade.opacity, y: fade.y, scale: fade.scale, filter: fade.filter } : undefined;

  return (
    <SceneContext.Provider value={reduce ? true : fade.active}>
      <section
        id={id}
        ref={ref}
        style={pinned ? { height: `${height}vh` } : undefined}
        className={cn("relative scroll-mt-16 overflow-x-clip", surfaces[surface], className)}
      >
        <motion.div
          style={style}
          className={cn(
            "will-change-[opacity,transform]",
            pinned
              ? cn("sticky top-0 flex h-screen overflow-hidden pt-20 pb-5", align === "center" ? "items-center" : "items-start")
              : "relative py-20 sm:py-28",
          )}
        >
          <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-14", contentClassName)}>
            <FitToViewport enabled={pinned}>
              {typeof children === "function"
                ? children({ progress: fade.scrollYProgress, enter: fade.enter, exit: fade.exit })
                : children}
            </FitToViewport>
          </div>
        </motion.div>
      </section>
    </SceneContext.Provider>
  );
}
