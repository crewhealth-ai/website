import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Brain, Check, Database, Repeat, Zap } from "lucide-react";
import { useRef, useState } from "react";
import Badge from "../components/Badge";
import Scene, { FitToViewport, SceneContext, useSceneFade } from "../components/Scene";
import SectionHeading from "../components/SectionHeading";
import { usePinnable } from "../lib/useDesktop";
import { cn } from "../lib/utils";

const steps = [
  { icon: Database, title: "Connect", body: "EHR data over FHIR and HL7, claims, labs, scheduling and financial feeds land in one longitudinal record." },
  { icon: Brain, title: "Understand", body: "Measure, risk and cohort models evaluate every patient daily. Analysts explore the same data, and agents reason over it with citations." },
  { icon: Zap, title: "Act", body: "Agents draft outreach, book visits, query providers and assemble submissions. Your policy decides what needs a person." },
  { icon: Repeat, title: "Learn", body: "Outcomes flow back. Agents learn which channels and timings work, and leaders see the effect on cost and quality." },
];

const scenes = [SceneConnect, SceneUnderstand, SceneAct, SceneLearn];

export default function HowItWorks() {
  const pinnable = usePinnable();
  return pinnable ? <PinnedSteps /> : <StackedSteps />;
}

/** Phones and tablets: each step with its scene, in flow. */
function StackedSteps() {
  return (
    <Scene id="how" mode="flow" surface="white">
      <SectionHeading align="left" title="From raw feeds to closed loops." />
      <ol className="mt-10 space-y-10">
        {steps.map((s, i) => (
          <StackedStep key={s.title} index={i} step={s} />
        ))}
      </ol>
    </Scene>
  );
}

function StackedStep({ index, step }: { index: number; step: (typeof steps)[number] }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const Panel = scenes[index];
  return (
    <li ref={ref}>
      <div className="flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-700">
          <step.icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-heading text-xl font-semibold text-fg">{step.title}</p>
          <p className="mt-1.5 text-[16px] leading-relaxed text-fg/85">{step.body}</p>
        </div>
      </div>
      <div className="relative mt-5 aspect-[5/4] w-full overflow-hidden rounded-xl border border-line bg-surface p-5">
        <div className="absolute inset-0 bg-grid mask-fade-radial opacity-70" aria-hidden="true" />
        {inView && <Panel />}
      </div>
    </li>
  );
}

/** Desktop: the section pins for a few screens while the panel changes with each step. This is the page's one scroll-driven moment. */
function PinnedSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(3, Math.floor(v * 4))));
  const fade = useSceneFade(ref, 320, true);

  return (
    <SceneContext.Provider value={fade.active}>
      <section id="how" ref={ref} className="relative h-[320vh] scroll-mt-16 overflow-x-clip">
        <motion.div style={{ opacity: fade.opacity, y: fade.y, scale: fade.scale, filter: fade.filter }} className="sticky top-0 flex h-screen items-center overflow-hidden pt-20 pb-5 will-change-[opacity,transform]">
          <FitToViewport enabled className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-14">
            <div className="grid w-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <SectionHeading align="left" title="From raw feeds to closed loops." />
                <ol className="mt-8 space-y-1">
                  {steps.map((s, i) => {
                    const active = i === step;
                    return (
                      <li key={s.title}>
                        <button
                          onClick={() => {
                            const top = ref.current?.offsetTop ?? 0;
                            const h = ref.current?.offsetHeight ?? 0;
                            window.scrollTo({ top: top + (h - window.innerHeight) * ((i + 0.5) / 4), behavior: reduce ? "auto" : "smooth" });
                          }}
                          aria-current={active ? "step" : undefined}
                          className={cn(
                            "flex w-full items-start gap-4 rounded-xl p-4 text-left transition-[background-color,opacity] duration-300",
                            active ? "bg-surface shadow-card" : "opacity-55 hover:opacity-90",
                          )}
                        >
                          <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors", active ? "bg-primary-soft text-primary-700" : "bg-surface-2 text-muted")}>
                            <s.icon className="h-4 w-4" />
                          </span>
                          <span>
                            <span className="block font-heading text-lg font-semibold text-fg">{s.title}</span>
                            {/* CSS grid-rows transition: no JS measurement, so it never interrupts a scroll. */}
                            <span className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out", active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")} aria-hidden={!active}>
                              <span className="block overflow-hidden text-[16px] leading-relaxed text-fg/85">
                                <span className="block pt-1.5">{s.body}</span>
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8" role="img" aria-label={`${steps[step].title}: ${steps[step].body}`}>
                <div className="absolute inset-0 bg-grid mask-fade-radial opacity-70" aria-hidden="true" />
                <AnimatePresence mode="wait">
                  {step === 0 && <SceneConnect key="connect" />}
                  {step === 1 && <SceneUnderstand key="understand" />}
                  {step === 2 && <SceneAct key="act" />}
                  {step === 3 && <SceneLearn key="learn" />}
                </AnimatePresence>
              </div>
            </div>
          </FitToViewport>
        </motion.div>
      </section>
    </SceneContext.Provider>
  );
}

const sceneProps = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  className: "absolute inset-0 flex items-center justify-center",
};

function Hub({ label }: { label: string }) {
  return (
    <div className="absolute top-1/2 left-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-primary/30 bg-surface shadow-raised">
      <span className="text-[12px] text-subtle">Patient</span>
      <span className="font-heading text-[15px] font-semibold text-fg">{label}</span>
    </div>
  );
}

function SceneConnect() {
  const sources = ["EHR", "Claims", "ADT", "Labs", "Finance"];
  return (
    <motion.div {...sceneProps}>
      <div className="relative h-72 w-72">
        <Hub label="M. Lopez" />
        {sources.map((s, i) => {
          const a = (i / sources.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * 130;
          const y = Math.sin(a) * 130;
          return (
            <div key={s}>
              <svg viewBox="0 0 288 288" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                <motion.line x1={144} y1={144} x2={144 + x} y2={144 + y} style={{ stroke: "var(--color-primary)" }} strokeWidth="1.5"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }} />
              </svg>
              <motion.span
                initial={{ opacity: 0, x: x * 1.3, y: y * 1.3 }} animate={{ opacity: 1, x, y }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-fg"
              >
                {s}
              </motion.span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SceneUnderstand() {
  const rows = [
    { k: "30-day readmission risk", v: "0.81", tone: "text-amber" },
    { k: "HbA1c control", v: "Gap open", tone: "text-danger" },
    { k: "Colorectal screening", v: "Closed", tone: "text-accent-700" },
    { k: "Care team", v: "PCP Chen, RN Ortiz", tone: "text-fg" },
  ];
  return (
    <motion.div {...sceneProps}>
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-subtle">Evaluated daily</p>
            <p className="font-heading text-lg font-semibold text-fg">M. Lopez, 72</p>
          </div>
          <Badge tone="amber">Rising risk</Badge>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {rows.map((r, i) => (
            <motion.li key={r.k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }} className="flex items-center justify-between py-2.5 text-[14px]">
              <span className="text-muted">{r.k}</span>
              <span className={cn("font-medium tabular-nums", r.tone)}>{r.v}</span>
            </motion.li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-subtle">Drivers: 2 prior CHF admissions, 11 active medications, lives alone</p>
      </div>
    </motion.div>
  );
}

function SceneAct() {
  const acts = [
    { t: "Outreach drafted in Spanish", s: "Needs RN approval", tone: "amber" as const },
    { t: "PCP visit booked, Tue 10:40", s: "Done", tone: "green" as const },
    { t: "HbA1c order queued for the PCP", s: "Draft", tone: "blue" as const },
  ];
  return (
    <motion.div {...sceneProps}>
      <div className="flex w-full max-w-sm flex-col gap-3">
        {acts.map((a, i) => (
          <motion.div key={a.t} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
            <span className="text-[14px] font-medium text-fg">{a.t}</span>
            <Badge tone={a.tone}>{a.s}</Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SceneLearn() {
  const pts = [20, 26, 24, 34, 40, 38, 52, 58, 64, 70, 78, 86];
  const w = 320, h = 120;
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * w},${h - (p / 100) * h}`).join(" ");
  return (
    <motion.div {...sceneProps}>
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="font-heading text-[15px] font-semibold text-fg">Cost and quality impact</p>
          <Badge tone="green"><Check className="h-3 w-3" /> Traced to agent runs</Badge>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-32 w-full overflow-visible" aria-hidden="true">
          <motion.path d={d} fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeInOut" }} />
          <motion.circle cx={w} cy={h - (pts[pts.length - 1] / 100) * h} r="5" style={{ fill: "var(--color-accent)" }} stroke="#ffffff" strokeWidth="2"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
        </svg>
        <div className="mt-2 flex justify-between text-[13px] text-subtle"><span>January</span><span>December</span></div>
      </div>
    </motion.div>
  );
}
