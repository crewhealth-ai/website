import { motion, useReducedMotion } from "motion/react";
import { FileCheck2, Quote, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import Scene from "../components/Scene";
import SectionHeading from "../components/SectionHeading";
import { cn } from "../lib/utils";

const levels = [
  { name: "Suggest", desc: "The agent surfaces the recommendation and its evidence. A person does everything else." },
  { name: "Draft", desc: "The agent prepares the outreach, query or submission. A person edits and sends." },
  { name: "Act with approval", desc: "The agent executes after a one-click approval. The default for clinical outreach." },
  { name: "Act", desc: "The agent executes and reports. For low-risk, reversible tasks such as data reconciliation." },
];

/* Facts the product can stand behind, in place of invented outcome figures. */
const facts = [
  { icon: SlidersHorizontal, title: "Four autonomy levels", body: "Set per workflow, per practice or per risk tier, and changed without a release." },
  { icon: Quote, title: "Evidence on every action", body: "Each recommendation cites the claim, note, lab or ADT message behind it. No evidence, no action." },
  { icon: FileCheck2, title: "A complete audit trail", body: "Every read, draft, approval and submission is logged with who, what and why." },
  { icon: ShieldCheck, title: "HIPAA-ready, BAA included", body: "PHI is encrypted in transit and at rest. Prompts carry only task fields. Your data never trains a shared model." },
];

export default function Trust() {
  const [level, setLevel] = useState(2);
  const reduce = useReducedMotion();
  return (
    <Scene id="trust" height={150}>
      <SectionHeading title="Built for clinical oversight." description="Autonomy is a dial, not a switch, and nothing leaves the system without a record." />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-10">
        <div className="card rounded-xl p-6 sm:p-7">
          <h3 className="font-heading text-[20px] font-semibold text-fg">Try the dial: the Transitions of Care agent</h3>
          <p className="mt-1 text-[16px] text-muted">Choose how much the agent does on its own after a discharge.</p>
          <div className="relative mt-5 rounded-full bg-surface-2 p-1" role="radiogroup" aria-label="Autonomy level">
            <div className="relative grid grid-cols-4">
              <motion.span aria-hidden="true" className="absolute inset-y-0 w-1/4 rounded-full bg-action" animate={{ left: `${level * 25}%` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }} />
              {levels.map((l, i) => (
                <button key={l.name} role="radio" aria-checked={level === i} onClick={() => setLevel(i)}
                  className={cn("relative z-10 min-h-11 rounded-full px-1 py-2.5 text-center font-heading text-[13px] font-medium transition-colors sm:text-[15px]", level === i ? "text-white" : "text-muted hover:text-fg")}>
                  {l.name}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 min-h-[3.5rem] rounded-lg bg-primary-soft px-4 py-3 text-[16px] text-primary-900" aria-live="polite">{levels[level].desc}</p>
        </div>

        <ul className="grid content-start gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {facts.map((f) => (
            <li key={f.title} className="flex items-start gap-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-700"><f.icon className="h-4 w-4" /></span>
              <div>
                <p className="font-heading text-[17px] font-semibold text-fg">{f.title}</p>
                <p className="mt-1 text-[16px] leading-6 text-fg/85">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  );
}
