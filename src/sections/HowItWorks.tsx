import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Brain, Check, Database, FileText, FlaskConical, HeartPulse, Hospital, Mail, MessageSquareText, Phone, Pill, Repeat, Zap } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent } from "react";
import Badge from "../components/Badge";
import Scene, { FitToViewport, SceneContext, useSceneFade } from "../components/Scene";
import SectionHeading from "../components/SectionHeading";
import { usePinnable } from "../lib/useDesktop";
import { cn } from "../lib/utils";

const steps = [
  { icon: Database, title: "Connect", body: "EHR data over FHIR and HL7, claims, labs, pharmacy and scheduling feeds land in one longitudinal record." },
  { icon: Brain, title: "Understand", body: "Measure, risk and cohort models evaluate every patient daily. Analysts explore the same data, and agents reason over it with citations." },
  { icon: Zap, title: "Act", body: "Agents draft outreach, book visits, query providers and assemble submissions. Your policy decides what needs a person; patient outreach always does." },
  { icon: Repeat, title: "Learn", body: "Outcomes flow back. Within your workspace, agents learn which channels and timings work, and leaders see the effect on cost and quality." },
];

const scenes = [SceneConnect, SceneUnderstand, SceneAct, SceneLearn];
/* What each illustration shows. The step text beside the panel is already read, so the panel describes its picture. */
const sceneLabels = [
  "Illustration: five data feeds merging into one record for a fictional patient, M. López.",
  "Illustration: M. López's risk score rising over 90 days, with an open glycemic-status gap and the drivers behind the score.",
  "Illustration: a Spanish outreach message drafted for M. López, waiting for RN approval, with a held visit slot and a queued lab order.",
  "Illustration: response rates by channel in the demo workspace, the best outreach window, and care gaps closed trending up.",
];

export default function HowItWorks() {
  const pinnable = usePinnable();
  const reduce = useReducedMotion();
  return pinnable && !reduce ? <PinnedSteps /> : <StackedSteps />;
}

/** Phones and tablets: each step with its scene, in flow. */
function StackedSteps() {
  return (
    <Scene id="how" mode="flow" surface="white">
      <SectionHeading align="left" title="From raw feeds to closed loops." />
      <ol className="mt-10 space-y-12 md:space-y-10">
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
    <li ref={ref} className="md:grid md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-8">
      <div className="flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-700">
          <step.icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-heading text-xl font-semibold text-fg">{step.title}</p>
          <p className="mt-1.5 text-[16px] leading-relaxed text-fg/85">{step.body}</p>
        </div>
      </div>
      {/* Sized to the scene (about 300px of content), not to the page width, so tablets don't show a mostly empty box. */}
      {/* In the stacked layout the scene sits in normal flow, so the box hugs its content. */}
      <div role="img" aria-label={sceneLabels[index]} className="relative mt-5 w-full overflow-hidden rounded-xl border border-line bg-surface md:mt-0 [&>div:last-child]:relative [&>div:last-child]:inset-auto">
        <div className="absolute inset-0 bg-grid-ink mask-fade-radial" aria-hidden="true" />
        <Panel key={inView ? "in-view" : "waiting"} />
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

  const scrollToStep = (i: number, instant: boolean) => {
    const top = ref.current?.offsetTop ?? 0;
    const h = ref.current?.offsetHeight ?? 0;
    window.scrollTo({ top: top + (h - window.innerHeight) * ((i + 0.5) / 4), behavior: reduce || instant ? "auto" : "smooth" });
  };
  // Keyboard focus on a step shows that step, fully faded in.
  const onStepFocus = (i: number) => (e: FocusEvent<HTMLButtonElement>) => {
    if (e.currentTarget.matches(":focus-visible")) scrollToStep(i, true);
  };

  // The list keeps the height it has with its tallest step open, so the heading above it never moves.
  const listRef = useRef<HTMLOListElement>(null);
  const [listMin, setListMin] = useState<number>();
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const outer = [...el.querySelectorAll<HTMLElement>("[data-step-body]")];
      const inner = [...el.querySelectorAll<HTMLElement>("[data-step-body] > span")];
      const open = outer.reduce((sum, b) => sum + b.offsetHeight, 0);
      const tallest = Math.max(0, ...inner.map((b) => b.scrollHeight));
      setListMin(el.offsetHeight - open + tallest);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <SceneContext.Provider value={fade.active}>
      <section id="how" ref={ref} className="relative h-[320vh] scroll-mt-16 overflow-x-clip">
        <motion.div style={{ opacity: fade.opacity, y: fade.y, scale: fade.scale, filter: fade.filter, pointerEvents: fade.pointerEvents }} className="sticky top-0 flex h-screen items-center overflow-hidden pt-20 pb-5 will-change-[opacity,transform]">
          <FitToViewport enabled className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-14">
            <div className="grid w-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <SectionHeading align="left" title="From raw feeds to closed loops." />
                <ol ref={listRef} className="mt-8 space-y-1" style={{ minHeight: listMin }}>
                  {steps.map((s, i) => {
                    const active = i === step;
                    return (
                      <li key={s.title}>
                        <button
                          onClick={() => scrollToStep(i, false)}
                          onFocus={onStepFocus(i)}
                          aria-current={active ? "step" : undefined}
                          className={cn(
                            "group flex w-full items-start gap-4 rounded-xl p-4 text-left transition-[background-color,box-shadow] duration-300",
                            active ? "bg-surface shadow-card" : "hover:bg-surface/60",
                          )}
                        >
                          <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors", active ? "bg-primary-soft text-primary-700" : "bg-surface-2 text-muted")}>
                            <s.icon className="h-4 w-4" />
                          </span>
                          <span>
                            <span className={cn("block font-heading text-lg font-semibold transition-colors duration-300", active ? "text-fg" : "text-muted group-hover:text-fg")}>{s.title}</span>
                            {/* CSS grid-rows transition: no JS measurement, so it never interrupts a scroll. */}
                            <span data-step-body className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out", active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")} aria-hidden={!active}>
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

              <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-line bg-surface" role="img" aria-label={sceneLabels[step]}>
                <div className="absolute inset-0 bg-grid-ink mask-fade-radial" aria-hidden="true" />
                {/* Scenes are stacked absolutely, so the outgoing and incoming scene cross-fade with no blank gap. */}
                <AnimatePresence initial={false}>
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
  className: "absolute inset-0 flex items-center justify-center p-4 sm:p-6",
};

const rise = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.08 + i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
});

/* Connect: five feeds arriving on the left, merged into one patient record on the right. */
function SceneConnect() {
  const sources = [
    { icon: Hospital, name: "EHR", sub: "FHIR R4", n: "1,204" },
    { icon: FileText, name: "Claims", sub: "CCLF, 837/835", n: "38" },
    { icon: HeartPulse, name: "ADT", sub: "HL7 v2", n: "6" },
    { icon: FlaskConical, name: "Labs", sub: "ORU", n: "22" },
    { icon: Pill, name: "Pharmacy", sub: "Fill history", n: "12" },
  ];
  const fields = [
    { k: "Encounters", v: "14" },
    { k: "Conditions", v: "CHF, T2DM" },
    { k: "Medications", v: "11 active" },
    { k: "Discharged", v: "Wednesday" },
  ];
  return (
    <motion.div {...sceneProps}>
      <div className="grid w-full max-w-md grid-cols-[1fr_28px_1.15fr] items-center gap-2">
        <ul className="space-y-1.5">
          {sources.map((s, i) => (
            <motion.li key={s.name} {...rise(i)} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-700"><s.icon className="h-3.5 w-3.5" /></span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-heading text-[12px] font-semibold text-fg">{s.name}</span>
                <span className="block truncate text-[11px] text-subtle">{s.sub}</span>
              </span>
              <span className="ml-auto text-[11px] font-medium text-primary-700 tabular-nums">{s.n}</span>
            </motion.li>
          ))}
        </ul>
        <ConnectorDots />
        <motion.div {...rise(5)} className="rounded-xl border border-primary/25 bg-surface p-3 shadow-raised">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-subtle">One record</span>
            <span className="flex items-center gap-1 text-[11px] text-accent-700"><Check className="h-3 w-3" /> Synced</span>
          </div>
          <p className="mt-0.5 font-heading text-[15px] font-semibold text-fg">M. López, 72</p>
          <ul className="mt-2 divide-y divide-line">
            {fields.map((f) => (
              <li key={f.k} className="flex items-center justify-between gap-2 py-1.5 text-[12px]">
                <span className="text-muted">{f.k}</span>
                <span className="truncate font-medium text-fg">{f.v}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* Records flowing from the feeds into the record: a few passes once the panel is in view, then still.
   Moves with transforms only; under reduced motion one dot sits on the line. */
function ConnectorDots() {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(track, { once: true });
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const run = !reduce && inView && h > 0;
  return (
    <div ref={track} className="relative h-full" aria-hidden="true">
      <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-line-strong" />
      {[0, 1, 2].map((d) => (
        <motion.span key={d} className="absolute top-[15%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary"
          initial={{ y: 0, opacity: 0 }}
          animate={run ? { y: [0, h * 0.7], opacity: [0, 1, 0] } : reduce && d === 0 ? { y: h * 0.35, opacity: 1 } : { y: 0, opacity: 0 }}
          transition={run ? { duration: 1.5, repeat: 1, delay: d * 0.5, ease: "easeInOut" } : { duration: 0 }} />
      ))}
    </div>
  );
}

/* Understand: the evaluated patient, with a risk trend and the drivers behind it. */
function SceneUnderstand() {
  const rows = [
    { k: "Glycemic status", v: "Gap open", tone: "text-danger" },
    { k: "Colorectal screening", v: "Closed", tone: "text-accent-700" },
    { k: "Care team", v: "PCP Chen, RN Ortiz", tone: "text-fg" },
  ];
  const pts = [0.38, 0.41, 0.4, 0.46, 0.52, 0.5, 0.61, 0.69, 0.74, 0.81];
  const w = 400, h = 54;
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * w},${h - p * h}`).join(" ");
  return (
    <motion.div {...sceneProps}>
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] text-subtle">Evaluated daily</p>
            <p className="font-heading text-[16px] font-semibold text-fg">M. López, 72</p>
          </div>
          <Badge tone="amber">Rising risk</Badge>
        </div>
        <div className="mt-3 rounded-lg bg-surface-2/70 px-3 pt-2 pb-1">
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="text-muted">Risk score, last 90 days</span>
            <span className="font-heading font-semibold text-amber tabular-nums">0.81</span>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-1 h-12 w-full overflow-visible" aria-hidden="true">
            <motion.path d={d} fill="none" style={{ stroke: "var(--color-amber)" }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: "easeInOut" }} />
          </svg>
        </div>
        <ul className="mt-2 divide-y divide-line">
          {rows.map((r, i) => (
            <motion.li key={r.k} {...rise(i)} className="flex items-center justify-between gap-3 py-2 text-[13px]">
              <span className="text-muted">{r.k}</span>
              <span className={cn("font-medium", r.tone)}>{r.v}</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["2 prior CHF admissions", "11 active medications", "Lives alone"].map((t) => (
            <span key={t} className="rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-medium text-amber">{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* Act: the drafted outreach waiting for a clinician, with the other actions it queued. */
function SceneAct() {
  const queued = [
    { t: "PCP slot held, Tue 10:40", s: "Held", tone: "blue" as const },
    { t: "HbA1c order queued for the PCP", s: "Draft", tone: "blue" as const },
  ];
  return (
    <motion.div {...sceneProps}>
      <div className="flex w-full max-w-md flex-col gap-2.5">
        <motion.div {...rise(0)} className="rounded-xl border border-amber/40 bg-surface p-3.5 shadow-raised">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-fg"><MessageSquareText className="h-3.5 w-3.5 text-primary-700" /> Outreach drafted in Spanish</span>
            <Badge tone="amber">Needs RN approval</Badge>
          </div>
          <p lang="es" className="mt-2 rounded-lg bg-surface-2/70 px-3 py-2 text-[12px] leading-relaxed text-fg/85">
            “Hola, Sr. López. ¿Cómo se siente desde que salió del hospital? Pésese todas las mañanas. ¿Puede venir a una cita con el Dr. Chen el martes a las 10:40?”
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="whitespace-nowrap rounded-full bg-action px-3 py-1 text-[12px] font-medium text-white">Approve and send</span>
            <span className="rounded-full border border-line-strong px-3 py-1 text-[12px] font-medium text-fg">Edit</span>
            <span className="ml-auto flex items-center gap-1 whitespace-nowrap text-[11px] text-subtle"><Phone className="h-3 w-3" /> Voice + SMS</span>
          </div>
        </motion.div>
        {queued.map((a, i) => (
          <motion.div key={a.t} {...rise(i + 1)} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5">
            <span className="text-[13px] font-medium text-fg">{a.t}</span>
            <Badge tone={a.tone}>{a.s}</Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* Learn: which outreach works, by channel, and the trend it moves. */
function SceneLearn() {
  const channels = [
    { icon: MessageSquareText, name: "SMS", rate: 62 },
    { icon: Phone, name: "Voice", rate: 41 },
    { icon: Mail, name: "Mail", rate: 18 },
  ];
  const pts = [20, 26, 24, 34, 40, 38, 52, 58, 64, 70, 78, 86];
  const w = 400, h = 60;
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * w},${h - (p / 100) * h}`).join(" ");
  return (
    <motion.div {...sceneProps}>
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-heading text-[15px] font-semibold text-fg">What the agents learned</p>
          <Badge tone="green"><Check className="h-3 w-3" /> Traced to agent runs</Badge>
        </div>
        <p className="mt-3 text-[12px] text-muted">Response rate by channel, demo workspace</p>
        <ul className="mt-1.5 space-y-1.5">
          {channels.map((c, i) => (
            <li key={c.name} className="flex items-center gap-2 text-[12px]">
              <c.icon className="h-3.5 w-3.5 text-primary-700" />
              <span className="w-10 text-fg">{c.name}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <motion.i className="block h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${c.rate}%` }} transition={{ delay: 0.15 + i * 0.1, duration: 0.7 }} />
              </span>
              <span className="w-9 text-right font-medium text-fg tabular-nums">{c.rate}%</span>
            </li>
          ))}
        </ul>
        <span className="mt-2.5 inline-flex rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-700">Best window: Tue to Thu, 9 to 11 am</span>
        <div className="mt-3 border-t border-line pt-2.5">
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="text-muted">Care gaps closed, this year</span>
            <span className="font-medium text-accent-700">Trending up</span>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-1 h-12 w-full overflow-visible" aria-hidden="true">
            <motion.path d={d} fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="2.5" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeInOut" }} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
