import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Bot, Check, RotateCcw, Server, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import Scene from "../components/Scene";
import SectionHeading from "../components/SectionHeading";
import { demoScenarios, type DemoStep } from "../lib/data";
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
    const t = setTimeout(() => setVisible((v) => v + 1), visible === 0 ? 300 : 1100);
    return () => clearTimeout(t);
  }, [inView, visible, waiting, done, reduce, scenario.steps.length, active]);

  return (
    <Scene id="demo" mode="flow" surface="white">
      <SectionHeading title="Every run is a sequence a clinician can approve." description="Pick a scenario. Each step shows what the agent read, what it decided, and where a person stepped in." />

      <div ref={ref} className="mt-12 grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" role="tablist" aria-label="Scenario">
          {demoScenarios.map((s) => (
            <button key={s.id} role="tab" aria-selected={active === s.id} onClick={() => setActive(s.id)}
              className={cn("shrink-0 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 lg:shrink", active === s.id ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-line-strong")}>
              <p className="font-heading text-[16px] font-semibold text-fg">{s.name}</p>
              <p className="mt-0.5 text-[14px] text-muted">{s.agent}</p>
            </button>
          ))}
        </div>

        <div className="card rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="font-heading text-[16px] font-semibold text-fg">{scenario.patient}</p>
            <Button size="sm" variant="secondary" onClick={() => { setVisible(0); setApproved(false); }}>
              <RotateCcw className="h-4 w-4" /> Replay
            </Button>
          </div>

          <ol className="mt-5 space-y-3" aria-live="polite">
            <AnimatePresence initial={false}>
              {scenario.steps.slice(0, visible).map((step, i) => {
                const m = actorMeta[step.actor];
                const isHumanWaiting = step.actor === "human" && waiting;
                return (
                  <motion.li key={`${scenario.id}-${i}`} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={cn("flex gap-4 rounded-xl border p-4", isHumanWaiting ? "border-accent/40 bg-accent-soft/50" : "border-line bg-surface")}>
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", m.cls)}><m.icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="font-heading text-[16px] font-semibold text-fg">{step.title}</p>
                        <span className="text-[13px] font-medium text-subtle">{m.label}</span>
                      </div>
                      <p className="mt-1 text-[15px] leading-relaxed text-fg/85">{step.detail}</p>
                      {isHumanWaiting && (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <Button size="sm" onClick={() => setApproved(true)}><Check className="h-4 w-4" /> Approve and continue</Button>
                          <span className="text-[14px] text-accent-700">Waiting for clinician approval</span>
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {!done && !waiting && visible > 0 && (
              <li className="flex items-center gap-3 px-4 py-2 text-[14px] text-subtle">
                <span className="flex gap-1">{[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-primary" animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />)}</span>
                Agent working
              </li>
            )}
          </ol>

          <AnimatePresence>
            {done && (
              <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent-soft/50 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-white"><Check className="h-5 w-5" /></span>
                <div><p className="font-heading text-[16px] font-semibold text-fg">Loop closed</p><p className="mt-0.5 text-[15px] text-fg/85">{scenario.outcome}</p></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Scene>
  );
}
