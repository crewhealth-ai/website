import { ArrowRight, MessageSquareText, PhoneCall } from "lucide-react";
import Badge from "../components/Badge";
import Scene from "../components/Scene";
import SectionHeading from "../components/SectionHeading";
import { agents } from "../lib/data";
import { cn } from "../lib/utils";

/**
 * Two feature cards carry the two agents that do most of the work, each with a
 * fragment of its own product UI. The other six are a plain list: title and one line.
 */
export default function Agents() {
  const [careGap, transitions, ...rest] = agents;
  return (
    <Scene id="agents" height={160}>
      <SectionHeading title="One crew for every workflow your teams run." description="Agents for population health, care management, quality, operations and finance, each connected to the data you already have. Start with the workflows you need and add more as you grow." />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <FeatureCard agent={careGap}>
          <GapWorklist />
        </FeatureCard>
        <FeatureCard agent={transitions}>
          <DischargeTimeline />
        </FeatureCard>
      </div>

      <ul className="mt-6 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <li key={a.name} className="flex items-start gap-3 rounded-xl py-3 pr-2">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-700"><a.icon className="h-4 w-4" /></span>
            <span>
              <span className="block font-heading text-[16px] font-semibold text-fg">{a.name}</span>
              <span className="block text-[15px] text-muted">{a.short}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-3xl text-[16px] leading-relaxed text-fg/85">
        Every agent runs on the same analytics layer: dashboards, cohorts, quality measures and forecasts your analysts can query directly.
      </p>
    </Scene>
  );
}

function FeatureCard({ agent, children }: { agent: (typeof agents)[number]; children: React.ReactNode }) {
  return (
    <article className="card flex flex-col overflow-hidden rounded-xl">
      <div className="p-6 pb-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary-700"><agent.icon className="h-4 w-4" /></span>
          <h3 className="font-heading text-[20px] font-semibold text-fg">{agent.name}</h3>
        </div>
        <p className="mt-3 text-[16px] leading-6 text-fg/85">{agent.description}</p>
      </div>
      <div className="relative mt-auto h-[200px] overflow-hidden border-t border-line bg-surface-2/70 px-6 pt-5 mask-fade-tail" aria-hidden="true">
        {children}
      </div>
    </article>
  );
}

/* Product fragment: the care-gap worklist, with the one row being worked on in the accent. */
function GapWorklist() {
  const rows = [
    { patient: "D. Alvarez, 64", measure: "HbA1c control", state: "Outreach sent by SMS", live: true },
    { patient: "K. Osei, 58", measure: "Colorectal screening", state: "FIT kit mailed" },
    { patient: "S. Whitfield, 71", measure: "BP control", state: "Visit booked Thu 9:20" },
    { patient: "P. Dubois, 66", measure: "Breast cancer screening", state: "Evidence found, gap closed" },
  ];
  return (
    <div className="rounded-xl border border-line bg-surface text-[13px]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-semibold text-fg">Open gaps, Dr. Chen's panel</span>
        <span className="text-subtle">1,284 open</span>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.patient} className={cn("flex items-center gap-3 px-4 py-2.5", r.live && "bg-primary-soft/60")}>
            <span className="w-[120px] truncate font-medium text-fg">{r.patient}</span>
            <span className="w-[150px] truncate text-muted">{r.measure}</span>
            <span className={cn("ml-auto flex items-center gap-1.5 truncate", r.live ? "text-primary-700" : "text-subtle")}>
              {r.live && <MessageSquareText className="h-3.5 w-3.5" />}
              {r.state}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Product fragment: the thirty days after a discharge, with the step in progress in the accent. */
function DischargeTimeline() {
  const steps = [
    { when: "Tue 14:12", what: "Discharged from Mercy General, CHF", done: true },
    { when: "Day 1", what: "Interactive contact by phone, medications reconciled", done: true, icon: PhoneCall },
    { when: "Day 6", what: "PCP visit Tue 10:40, TCM 99496 eligible", live: true },
    { when: "Day 30", what: "Readmission window closes" },
  ];
  return (
    <div className="rounded-xl border border-line bg-surface p-4 text-[13px]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-fg">M. Lopez, 72</span>
        <Badge tone="amber">Readmission risk 0.81</Badge>
      </div>
      <ol className="mt-3 space-y-2.5">
        {steps.map((s) => (
          <li key={s.when} className="flex items-start gap-3">
            <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", s.done ? "bg-accent" : s.live ? "bg-primary ring-4 ring-primary/15" : "border border-line-strong bg-surface")} />
            <span className="w-16 shrink-0 text-subtle">{s.when}</span>
            <span className={cn("flex items-center gap-1.5", s.live ? "font-medium text-primary-700" : "text-fg")}>
              {s.what}
              {s.live && <ArrowRight className="h-3.5 w-3.5" />}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
