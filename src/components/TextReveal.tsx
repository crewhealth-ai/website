import { motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/utils";
import { useSceneActive } from "./Scene";

/**
 * Reveals a sentence word by word, each sliding up through its own mask.
 * Wrap a phrase in [[double brackets]] to render it with the gradient.
 * Inside a Scene it plays when the scene becomes active; otherwise on view.
 */
export default function TextReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.045,
  once = true,
  animateOn = "auto",
  active = true,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  animateOn?: "auto" | "view" | "mount";
  active?: boolean;
}) {
  const reduce = useReducedMotion();
  const scene = useSceneActive();
  const tokens = tokenize(text);
  let i = 0;

  const content = tokens.map((t, k) => {
    const idx = i++;
    return (
      <span key={k} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] pr-[0.25em]">
        <motion.span
          className="inline-block will-change-transform"
          variants={{
            hidden: { y: "110%", opacity: 0, filter: "blur(8px)" },
            show: {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              transition: { duration: 0.9, delay: delay + idx * stagger, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {t.gradient ? <span className="text-emphasis">{t.word}</span> : t.word}
        </motion.span>
      </span>
    );
  });

  const MotionTag = motion[Tag];
  const mode = animateOn === "auto" ? (scene !== null ? "scene" : "view") : animateOn;
  const props =
    mode === "mount"
      ? { initial: reduce ? "show" : "hidden", animate: active ? "show" : "hidden" }
      : mode === "scene"
        ? { initial: reduce ? "show" : "hidden", animate: scene || reduce ? "show" : "hidden" }
        : {
            initial: reduce ? "show" : "hidden",
            whileInView: "show",
            viewport: { once, margin: "-10% 0px -10% 0px" },
          };

  return (
    <MotionTag className={cn("leading-[1.02]", className)} {...props}>
      {content}
    </MotionTag>
  );
}

function tokenize(text: string): { word: string; gradient: boolean }[] {
  const out: { word: string; gradient: boolean }[] = [];
  const re = /\[\[(.+?)\]\]|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[1]) m[1].split(/\s+/).forEach((w) => out.push({ word: w, gradient: true }));
    else out.push({ word: m[2], gradient: false });
  }
  return out;
}
