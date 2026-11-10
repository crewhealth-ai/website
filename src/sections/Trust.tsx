import { motion, useReducedMotion } from "motion/react";
import { FileCheck2, Quote, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import Scene from "../components/Scene";
import SectionHeading from "../components/SectionHeading";
import { cn } from "../lib/utils";

const levels = [
  { name: "Suggest", desc: "The agent surfaces the recommendation and its evidence. A person does everything else." },
  { name: "Draft", desc: "The agent prepares the outreach, query or submission. A person edits and sends." },
  { name: "Act with approval", desc: "The agent executes after a one-click approval. Required for anything that reaches a patient." },
  { name: "Act", desc: "The agent executes and reports. Only for low-risk back-office tasks, never patient contact." },
];

/* Facts the product can stand behind, in place of invented outcome figures. */
const facts = [
  { icon: SlidersHorizontal, title: "Four autonomy levels", body: "Set per workflow, per practice or per risk tier, and changed without a release." },
  { icon: Quote, title: "Evidence on every action", body: "Each recommendation cites the claim, note, lab or ADT message behind it. No evidence, no action." },
  { icon: FileCheck2, title: "A complete audit trail", body: "Every read, draft, approval and submission is logged with who did it, when, and the evidence behind it." },
  { icon: ShieldCheck, title: "A HIPAA BAA before any PHI", body: "PHI is encrypted in transit and at rest. Prompts include only the data a task needs. Your data is never used to train models for other customers." },
];

export default function Trust() {
  const [level, setLevel] = useState(2);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  return (
    <Scene id="trust" height={150}>
      <SectionHeading title="Built for clinical oversight." description="Autonomy is a dial, not a switch, and nothing leaves the system without a record." />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-10">
        <div className="card rounded-xl p-6 sm:p-7">
          <h3 className="font-heading text-[20px] font-semibold text-fg">Try the dial on the Transitions of Care agent</h3>
          <p className="mt-1 text-[16px] text-muted">Choose how much the agent does on its own after a discharge.</p>
          {/* Radio group pattern: one tab stop, arrow keys move the selection. Rounded rectangles rather than
              pills, so a label that wraps on a narrow screen keeps a sensible shape. */}
          <div className="relative mt-5 rounded-[22px] bg-surface-2 p-1" role="radiogroup" aria-label="Autonomy level">
            <div className="relative grid grid-cols-4">
              <motion.span aria-hidden="true" className="absolute inset-y-0 left-0 w-1/4 rounded-[18px] bg-action" animate={{ x: `${level * 100}%` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 36 }} />
              {levels.map((l, i) => (
                <button key={l.name} role="radio" aria-checked={level === i} tabIndex={level === i ? 0 : -1}
                  ref={(el) => { radios.current[i] = el; }}
                  onClick={() => setLevel(i)}
                  onKeyDown={(e) => {
                    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
                    if (!step) return;
                    e.preventDefault();
                    const j = (i + step + levels.length) % levels.length;
                    setLevel(j);
                    radios.current[j]?.focus();
                  }}
                  className={cn("relative z-10 min-h-11 rounded-[18px] px-1 py-2.5 text-center font-heading text-[13px] leading-tight font-medium transition-colors sm:text-[15px]", level === i ? "text-white forced-colors:outline forced-colors:outline-2" : "text-muted hover:text-fg")}>
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
