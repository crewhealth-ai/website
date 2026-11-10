import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Bot, Check, RotateCcw, Server, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Button from "../components/Button";
import Scene from "../components/Scene";
import SectionHeading from "../components/SectionHeading";
import { demoScenarios, type DemoScenario, type DemoStep } from "../lib/data";
import { cn } from "../lib/utils";

const actorMeta: Record<DemoStep["actor"], { icon: typeof Bot; label: string; cls: string }> = {
  agent: { icon: Bot, label: "Agent", cls: "bg-primary-soft text-primary-700" },
  system: { icon: Server, label: "System", cls: "bg-surface-2 text-muted" },
  human: { icon: UserRound, label: "Clinician", cls: "bg-accent-soft text-accent-700" },
};

export default function AgentDemo() {
  const [active, setActive] = useState(demoScenarios[0].id);
  const [visible, setVisible] = useState(0);
  const [approved, setApproved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();

  const scenario = demoScenarios.find((s) => s.id === active)!;
  const humanIndex = scenario.steps.findIndex((s) => s.actor === "human");
  const waiting = visible === humanIndex + 1 && !approved;
  const done = visible >= scenario.steps.length;

  useEffect(() => { setVisible(0); setApproved(false); }, [active]);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setVisible(scenario.steps.length); setApproved(true); return; }
    if (waiting || done) return;
    // The first step after the approval follows the click quickly, then the run keeps its pace.
    const afterApproval = approved && visible === humanIndex + 1;
    const t = setTimeout(() => setVisible((v) => v + 1), visible === 0 ? 300 : afterApproval ? 450 : 1100);
    return () => clearTimeout(t);
  }, [inView, visible, waiting, done, reduce, scenario.steps.length, active, approved, humanIndex]);

  // Tabs pattern: arrow keys move between scenarios and select them, Home and End jump to the ends.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = demoScenarios.length;
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const j = (next + n) % n;
    setActive(demoScenarios[j].id);
    tabs.current[j]?.focus();
  };

  return (
    <Scene id="demo" mode="flow" surface="white">
      <SectionHeading title="Every run is a sequence a clinician can approve." description="Pick a scenario. Each step shows what the agent read, what it decided, and where a person stepped in. The patients and hospitals are fictional." />

      <div ref={ref} className="mt-12 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:content-start" role="tablist" aria-label="Scenario">
          {demoScenarios.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => { tabs.current[i] = el; }}
              id={`demo-tab-${s.id}`}
              role="tab"
              aria-selected={active === s.id}
              aria-controls="demo-panel"
              tabIndex={active === s.id ? 0 : -1}
              onClick={() => setActive(s.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={cn(
                "min-w-0 rounded-xl border px-4 py-3 text-left transition-colors duration-200 forced-colors:border-[CanvasText]",
                active === s.id ? "border-primary bg-primary-soft forced-colors:border-[Highlight] forced-colors:outline forced-colors:outline-2" : "border-line bg-surface hover:border-line-strong",
              )}
            >
              <p className="font-heading text-[16px] font-semibold text-fg">{s.name}</p>
              <p className="mt-0.5 text-[14px] text-muted">{s.agent}</p>
            </button>
          ))}
        </div>

        <div id="demo-panel" role="tabpanel" aria-labelledby={`demo-tab-${scenario.id}`} className="card min-w-0 rounded-xl p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="min-w-0 font-heading text-[16px] font-semibold text-fg">{scenario.patient}</p>
            <Button size="sm" variant="secondary" onClick={() => { setVisible(0); setApproved(false); }}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Replay
            </Button>
          </div>

          {/* Steps appear one at a time. The run stops at the clinician step until someone approves it. */}
          <ol className="mt-5 space-y-3">
            <AnimatePresence initial={false}>
              {scenario.steps.slice(0, visible).map((step, i) => (
                <RunStep
                  key={`${scenario.id}-${i}`}
                  step={step}
                  waiting={step.actor === "human" && waiting}
                  approved={step.actor === "human" && approved}
                  onApprove={() => setApproved(true)}
                />
              ))}
            </AnimatePresence>
            {!done && !waiting && visible > 0 && (
              <li className="flex items-center gap-3 px-4 py-2 text-[14px] text-subtle">
                <span className="flex gap-1" aria-hidden="true">{[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-primary" animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />)}</span>
                Agent working…
              </li>
            )}
          </ol>
          <p className="sr-only" aria-live="polite">
            {done ? `Run complete. ${scenario.outcome}` : waiting ? "Waiting for clinician approval." : visible > 0 ? `Step ${visible} of ${scenario.steps.length}: ${scenario.steps[visible - 1].title}.` : ""}
          </p>

          <AnimatePresence>
            {done && (
              <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Outcome scenario={scenario} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Scene>
  );
}

/** One step of a run. After approval the button stays where it was, as "Approved", so keyboard focus is not lost. */
function RunStep({ step, waiting, approved, onApprove }: { step: DemoStep; waiting: boolean; approved: boolean; onApprove: () => void }) {
  const reduce = useReducedMotion();
  const m = actorMeta[step.actor];
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4", waiting ? "border-accent/40 bg-accent-soft/50" : "border-line bg-surface")}
    >
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", m.cls)}><m.icon className="h-4 w-4" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="font-heading text-[16px] font-semibold text-fg">{step.title}</p>
          <span className="text-[13px] font-medium text-subtle">{m.label}</span>
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-fg/85">{step.detail}</p>
        {(waiting || approved) && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm" variant={approved ? "secondary" : "primary"} aria-disabled={approved || undefined} onClick={() => { if (!approved) onApprove(); }}>
              <Check className="h-4 w-4" aria-hidden="true" /> {approved ? "Approved" : "Approve and continue"}
            </Button>
            {waiting && <span className="text-[14px] text-accent-700">Waiting for clinician approval</span>}
          </div>
        )}
      </div>
    </motion.li>
  );
}

function Outcome({ scenario }: { scenario: DemoScenario }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent-soft/50 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-white"><Check className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0"><p className="font-heading text-[16px] font-semibold text-fg">Loop closed</p><p className="mt-0.5 text-[15px] text-fg/85">{scenario.outcome}</p></div>
    </div>
  );
}
