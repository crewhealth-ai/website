import { motion, useMotionTemplate, useReducedMotion, useTransform } from "motion/react";
import { ArrowRight, Lock, Play, ShieldCheck, UserCheck } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import AgentConsole from "../components/AgentConsole";
import Button from "../components/Button";
import ScaledFrame from "../components/ScaledFrame";
import { useSceneFade } from "../components/Scene";
import TextReveal from "../components/TextReveal";
import { usePinnable } from "../lib/useDesktop";

const HEIGHT = 200;

const facts = [
  { icon: ShieldCheck, label: "HIPAA-ready, BAA included" },
  { icon: UserCheck, label: "A clinician approves each action" },
  { icon: Lock, label: "Every action logged" },
];

export default function Hero() {
  const reduce = useReducedMotion();
  const pinnable = usePinnable();
  const pinned = pinnable && !reduce;
  const ref = useRef<HTMLElement>(null);
  const fade = useSceneFade(ref, HEIGHT, pinned);

  const { scrollYProgress: p, exit } = fade;
  // The hero starts at the very top of the page: its scroll animation begins exactly at the
  // progress value for scrollY = 0 (fade.unit), not at the earlier ramp used by later scenes.
  const enter = fade.unit;
  const mid = enter + (exit - enter) * 0.55;

  // The console rises by the height of the copy block it replaces (plus the gap), so when the
  // headline has faded the console sits where the headline was, directly under the navbar.
  const copyRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const lift = useRef(400);
  const grow = useRef(1.12);
  useLayoutEffect(() => {
    const measure = () => {
      const copy = copyRef.current;
      const con = consoleRef.current;
      if (!copy || !con) return;
      lift.current = con.offsetTop - copy.offsetTop;
      // Grow to fill the width once the copy is gone, but never past the viewport edges.
      grow.current = Math.max(1, Math.min(1.18, (window.innerWidth - 96) / con.offsetWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (copyRef.current) ro.observe(copyRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const progress = (v: number) => Math.min(1, Math.max(0, (v - enter) / (mid - enter)));
  const consoleY = useTransform(p, (v) => (pinned ? 110 + (-lift.current - 110) * ease(progress(v)) : 0));
  const consoleScale = useTransform(p, (v) => (pinned ? 0.96 + (grow.current - 0.96) * ease(progress(v)) : 1));
  // The bottom fade only matters while the console is still partly below the fold; lift it as the console rises.
  const maskStop = useTransform(p, (v) => (pinned ? 82 + 18 * ease(progress(v)) : 82));
  const consoleMask = useMotionTemplate`linear-gradient(to bottom, black ${maskStop}%, transparent)`;
  const copyY = useTransform(p, (v) => (pinned ? -120 * ease(progress(v)) : 0));
  const copyOpacity = useTransform(p, (v) => (pinned ? 1 - Math.min(1, progress(v) / 0.6) : 1));
  const exitOpacity = useTransform(p, [exit, exit + 0.55 * fade.unit], pinned ? [1, 0] : [1, 1]);
  const exitY = useTransform(p, [exit, exit + 0.55 * fade.unit], pinned ? ["0vh", "47vh"] : ["0vh", "0vh"]);
  const exitBlur = useTransform(p, [exit, exit + 0.55 * fade.unit], pinned ? [0, 10] : [0, 0]);
  const exitFilter = useMotionTemplate`blur(${exitBlur}px)`;

  const enterAnim = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="top" ref={ref} style={pinned ? { height: `${HEIGHT}vh` } : undefined} className="relative overflow-x-clip">
      <motion.div
        style={pinned ? { opacity: exitOpacity, y: exitY, filter: exitFilter } : undefined}
        className={pinned ? "sticky top-0 h-screen overflow-hidden" : "relative overflow-hidden pt-24 pb-10"}
      >

        <div className="mx-auto flex h-full w-full max-w-7xl flex-col items-center px-5 pt-24 text-center sm:px-8 lg:px-14 lg:pt-[clamp(84px,11vh,112px)]">
          <motion.div ref={copyRef} style={{ y: copyY, opacity: copyOpacity }} className="flex flex-col items-center">
            <TextReveal
              as="h1"
              animateOn="mount"
              delay={0.05}
              stagger={0.07}
              text="AI agents and analytics for [[healthcare]] teams."
              className="max-w-[16ch] text-[40px] font-semibold text-fg sm:text-[56px] lg:text-[clamp(48px,8vh,72px)]"
            />
            <motion.p {...enterAnim(0.5)} className="mt-5 max-w-[52ch] text-[clamp(17px,2.2vh,20px)] leading-relaxed text-muted">
              CrewHealth turns clinical, claims and operational data into analytics and agents that act on it. Built first for accountable care, ready for health systems, payers and provider groups.
            </motion.p>
            <motion.div {...enterAnim(0.56)} className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" href="#contact">
                Book a demo <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="secondary" href="#demo">
                <Play className="h-4 w-4 fill-current" /> Watch an agent work
              </Button>
            </motion.div>
            <motion.ul {...enterAnim(0.62)} className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {facts.map((t) => (
                <li key={t.label} className="flex items-center gap-2 text-[15px] text-muted">
                  <t.icon className="h-4 w-4 text-accent" aria-hidden="true" /> {t.label}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            ref={consoleRef}
            initial={reduce ? false : { scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-[clamp(24px,4vh,40px)] w-full max-w-5xl"
          >
            <motion.div style={{ y: consoleY, scale: consoleScale, maskImage: consoleMask, WebkitMaskImage: consoleMask }} className="origin-top">
              <ScaledFrame width={1024}>
                <AgentConsole />
              </ScaledFrame>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
