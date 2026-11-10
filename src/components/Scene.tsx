import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { createContext, useContext, useLayoutEffect, useRef, useState, type FocusEvent, type ReactNode, type RefObject } from "react";
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

/** Peak blur, in px, while a scene fades in or out. At rest there is no filter at all. */
const BLUR = 10;

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
  const blurPx = useTransform(scrollYProgress, pts, pinned ? [BLUR, 0, 0, out ? BLUR : 0] : [0, 0, 0, 0]);
  // No filter at rest: a blur(0px) filter still costs a full-viewport filter pass on every frame.
  const filter = useTransform(blurPx, (v) => (v > 0.05 ? `blur(${v}px)` : "none"));
  // A fading layer is still in the box tree. Below this opacity it lets clicks through to the
  // section underneath, so an invisible scene never swallows a click meant for visible content.
  const pointerEvents = useTransform(opacity, (o) => (o > 0.6 ? "auto" : "none"));

  const [active, setActive] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const on = pinned ? v > a - 0.1 * unit && v < b : v > 0.04 && v < 1;
    if (on !== active) setActive(on);
  });

  return { scrollYProgress, opacity, y, scale, filter, pointerEvents, active, enter, exit, unit };
}

/**
 * Keyboard focus that lands inside a pinned scene while it is still fading in (or already fading
 * out) scrolls the page to where the scene is fully shown, so the focused control is always visible.
 * Mouse focus is left alone: a click already happens where the visitor can see.
 */
export function focusIntoScene(e: FocusEvent<HTMLElement>, section: HTMLElement | null) {
  if (!section) return;
  const target = e.target as HTMLElement;
  if (!target.matches?.(":focus-visible")) return;
  const vh = window.innerHeight;
  const top = section.getBoundingClientRect().top + window.scrollY;
  const start = top - 0.08 * vh + 4; // fully faded in
  const end = top + section.offsetHeight - vh - 4; // about to fade out
  const y = window.scrollY;
  if (y >= start && y <= end) return;
  window.scrollTo({ top: Math.min(Math.max(y, start, top - 64), Math.max(start, end)), behavior: "auto" });
}

/** Scales content down when it is a little taller than the viewport minus the nav, so a pinned scene is never clipped. */
export function FitToViewport({
  enabled,
  children,
  reserve = 104,
  className,
  onScale,
}: {
  enabled: boolean;
  children: ReactNode;
  reserve?: number;
  className?: string;
  /** Reports the scale the content would need, measured even while scaling is off. */
  onScale?: (s: number) => void;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const report = useRef(onScale);
  report.current = onScale;

  useLayoutEffect(() => {
    const measure = () => {
      const el = inner.current;
      if (!el) return;
      const natural = el.offsetHeight;
      const avail = window.innerHeight - reserve;
      const s = natural > 0 ? Math.min(1, avail / natural) : 1;
      report.current?.(s);
      setScale(enabled ? s : 1);
      setHeight(enabled && s < 1 ? natural * s : undefined);
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

/**
 * A scene pins only while its content fits at 85% or more of its natural size. Shorter windows
 * (laptops, zoomed browsers) get the same section in normal flow instead of text scaled down to 9px.
 * The two thresholds keep a window near the limit from flipping between the layouts.
 */
function useFits() {
  const [fits, setFits] = useState(true);
  const onScale = (s: number) => setFits((was) => (was ? s >= 0.85 : s >= 0.88));
  return [fits, onScale] as const;
}

const surfaces = { base: "bg-transparent", white: "bg-transparent", dark: "bg-primary-900 bg-grid-on-dark" } as const;

/** A scene in normal flow: fully shown, no transform, no filter. */
export const RESTING = { opacity: 1, y: 0, scale: 1, filter: "none", pointerEvents: "auto" } as const;

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
  const [fits, onScale] = useFits();
  const pinned = mode === "pinned" && pinnable && !reduce && fits;
  const ref = useRef<HTMLElement>(null);
  const fade = useSceneFade(ref, height, pinned, { exitFade, enterSlide });

  // In flow mode the values are set explicitly rather than left out: a scene can start pinned and then
  // unpin (it does not fit, or the window changed), and Motion keeps styles it already wrote otherwise.
  const style = pinned
    ? { opacity: fade.opacity, y: fade.y, scale: fade.scale, filter: fade.filter, pointerEvents: fade.pointerEvents }
    : RESTING;

  return (
    <SceneContext.Provider value={reduce ? true : fade.active}>
      <section
        id={id}
        ref={ref}
        style={pinned ? { height: `${height}vh` } : undefined}
        onFocusCapture={pinned ? (e) => focusIntoScene(e, ref.current) : undefined}
        className={cn("relative scroll-mt-16 overflow-x-clip", surfaces[surface], className)}
      >
        <motion.div
          style={style}
          className={cn(
            pinned
              ? cn("sticky top-0 flex h-screen overflow-hidden pt-20 pb-5 will-change-[opacity,transform]", align === "center" ? "items-center" : "items-start")
              : "relative py-20 sm:py-28",
          )}
        >
          <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-14", contentClassName)}>
            <FitToViewport enabled={pinned} onScale={mode === "pinned" && pinnable && !reduce ? onScale : undefined}>
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
