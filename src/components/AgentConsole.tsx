import { motion, useReducedMotion } from "motion/react";
import { Activity, Bot, ClipboardCheck, HeartPulse, LayoutDashboard, Route, Search, Settings, Users } from "lucide-react";
import { cn } from "../lib/utils";

const nav = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Bot, label: "Agents" },
  { icon: Users, label: "Population" },
  { icon: ClipboardCheck, label: "Quality" },
  { icon: Route, label: "Transitions" },
  { icon: Activity, label: "Outcomes" },
  { icon: Settings, label: "Settings" },
];

const kpis = [
  { label: "Gaps closed today", value: "142", delta: "+24 vs yesterday", good: true },
  { label: "Pending approvals", value: "9", delta: "RN queue, 4 min average wait", good: null },
  { label: "Discharges contacted in 2 business days", value: "31 of 33", delta: "This month", good: null },
];

const feed = [
  { who: "Transitions agent", what: "Patient reached. PCP follow-up booked Tue 10:40", tone: "green" },
  { who: "RN care manager", what: "Approved outreach with a note on the diuretic dose", tone: "green" },
  { who: "Transitions agent", what: "Readmission risk score 0.81, 3 drivers found", tone: "amber" },
  { who: "Care gap agent", what: "HbA1c gap closed, lab reconciled from the HIE", tone: "blue" },
  { who: "Preventive visit agent", what: "17 wellness visits booked for Dr. Chen on Thursday", tone: "blue" },
];

const risk = [
  { name: "M. López", age: 72, dx: "CHF", score: 0.81 },
  { name: "J. Patel", age: 68, dx: "CKD 3b", score: 0.64 },
  { name: "R. Nguyen", age: 75, dx: "COPD", score: 0.57 },
  { name: "T. Brennan", age: 66, dx: "T2DM", score: 0.42 },
];

const bars = [34, 48, 41, 62, 70, 66, 88, 94, 81, 103, 118, 142];

/** A product mockup of the CrewHealth console, the hero's rising object. Designed at 1024px wide and scaled by ScaledFrame. */
export default function AgentConsole({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("relative", className)} role="img" aria-label="Demo workspace of the CrewHealth console with fictional patients: today's closed gaps, pending approvals, agent activity, the rising-risk list and gaps closed by day.">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-float">
        <div className="flex items-center gap-3 border-b border-line bg-surface-2/60 px-4 py-2.5">
          <span className="flex gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-line-strong" /><i className="h-2.5 w-2.5 rounded-full bg-line-strong" /><i className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="ml-2 text-[12px] font-medium text-subtle">CrewHealth console · Demo workspace</span>
          <span className="ml-auto flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] text-subtle"><Search className="h-3.5 w-3.5" /> Search patients, agents, measures</span>
        </div>

        <div className="grid grid-cols-[156px_1fr]">
          <div className="border-r border-line bg-surface-2/40 p-3">
            <p className="px-2 text-[11px] font-medium text-subtle">Workspace</p>
            <ul className="mt-2 space-y-0.5">
              {nav.map((n) => (
                <li key={n.label} className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px]", n.active ? "bg-primary-soft font-medium text-primary-700" : "text-muted")}>
                  <n.icon className="h-3.5 w-3.5" /> {n.label}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-lg border border-accent/30 bg-accent-soft p-2.5">
              <p className="text-[11px] font-medium text-accent-700">Autonomy</p>
              <p className="mt-0.5 text-[13px] font-medium text-fg">Act with approval</p>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-xl border border-line bg-surface p-3.5">
                  <p className="text-[12px] text-muted">{k.label}</p>
                  <p className="mt-1 font-heading text-[28px] font-semibold leading-none tracking-[-0.03em] text-fg tabular-nums">{k.value}</p>
                  <p className={cn("mt-1.5 text-[12px]", k.good ? "text-accent-700" : "text-subtle")}>{k.delta}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-[1.25fr_1fr] gap-3">
              <div className="rounded-xl border border-line bg-surface p-3.5">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-[13px] font-semibold text-fg">Agent activity</p>
                  <span className="flex items-center gap-1.5 text-[12px] text-accent-700"><i className="h-1.5 w-1.5 rounded-full bg-accent" /> Today</span>
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  {feed.map((f, i) => (
                    <motion.li key={f.what} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.18, duration: 0.4 }}
                      className="flex items-start gap-2 rounded-lg border border-line px-2.5 py-2">
                      <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", f.tone === "green" && "bg-accent", f.tone === "amber" && "bg-amber", f.tone === "blue" && "bg-primary")} />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-medium text-subtle">{f.who}</span>
                        <span className="block truncate text-[13px] text-fg">{f.what}</span>
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-line bg-surface p-3.5">
                  <p className="font-heading text-[13px] font-semibold text-fg">Rising risk, next 30 days</p>
                  <ul className="mt-2 space-y-1.5">
                    {risk.map((r) => (
                      <li key={r.name} className="flex items-center gap-2 text-[12px]">
                        <HeartPulse className="h-3.5 w-3.5 text-amber" />
                        <span className="w-[84px] truncate text-fg">{r.name}, {r.age}</span>
                        <span className="w-12 text-subtle">{r.dx}</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                          <motion.i className="block h-full rounded-full bg-primary"
                            initial={reduce ? { width: `${r.score * 100}%` } : { width: 0 }} animate={{ width: `${r.score * 100}%` }} transition={{ delay: 0.6, duration: 0.9 }} />
                        </span>
                        <span className="w-8 text-right text-fg tabular-nums">{r.score.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-line bg-surface p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-[13px] font-semibold text-fg">Gaps closed by day</p>
                    <span className="text-[12px] text-subtle">Last 12 days</span>
                  </div>
                  <div className="mt-2 flex h-14 items-end gap-1.5">
                    {bars.map((b, i) => (
                      <motion.i key={i} className={cn("block flex-1 rounded-sm", i === bars.length - 1 ? "bg-primary" : "bg-primary-soft")}
                        initial={reduce ? { height: `${(b / 142) * 100}%` } : { height: 0 }} animate={{ height: `${(b / 142) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
