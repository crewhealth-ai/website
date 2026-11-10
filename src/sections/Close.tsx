import { ArrowRight, FileCheck2, ShieldCheck, Waypoints } from "lucide-react";
import { useState, type FormEvent } from "react";
import Button from "../components/Button";
import Logo from "../components/Logo";
import Scene from "../components/Scene";

const ENDPOINT = import.meta.env.VITE_DEMO_ENDPOINT as string | undefined;
const CONTACT_EMAIL = "hello@crewhealth.ai";

const proof = [
  { icon: ShieldCheck, text: "HIPAA BAA before any PHI is shared" },
  { icon: Waypoints, text: "Reads EHR (FHIR, HL7), claims and ADT" },
  { icon: FileCheck2, text: "Every action logged" },
];

type Status = { kind: "idle" | "sending" | "sent" | "error"; text: string };

/** The closing screen: the ask in its working form, proof beside it, and the footer on the same dark ground. */
export default function Close() {
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (!ENDPOINT) {
      const body = `Organization: ${data.org}\nWork email: ${data.email}\n\nPlease book a CrewHealth demo.`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Book a CrewHealth demo")}&body=${encodeURIComponent(body)}`;
      setStatus({ kind: "sent", text: `Your email app should open with this request. Press Send there to reach us. If nothing opens, write to ${CONTACT_EMAIL}.` });
      return;
    }
    setStatus({ kind: "sending", text: "Sending your request…" });
    try {
      const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ kind: "sent", text: "Request sent. We aim to reply within one business day." });
      form.reset();
    } catch {
      setStatus({ kind: "error", text: `We could not send this. Write to ${CONTACT_EMAIL} instead.` });
    }
  }

  const fieldClass = "h-12 w-full rounded-lg border border-white/25 bg-white px-4 text-[16px] text-fg placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <Scene id="contact" height={140} surface="dark" exitFade={false} enterSlide={false} className="[&_:focus-visible]:outline-white" contentClassName="text-white">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
        <div>
          <h2 className="text-[32px] leading-[1.1] text-white sm:text-[40px] lg:text-[clamp(36px,5.2vh,48px)]">See what CrewHealth finds in your data.</h2>
          <p className="mt-4 max-w-[48ch] text-[clamp(16px,2.1vh,18px)] leading-relaxed text-white/80">
            We walk you through the product on a call. Share a de-identified extract and we can also estimate the gaps, the risk and the savings that analytics and an agent crew could reach in year one. We aim to reply within one business day.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
            {proof.map((p) => (
              <li key={p.text} className="flex items-center gap-2 text-[15px] text-white/85">
                <p.icon className="h-4 w-4 text-white/70" aria-hidden="true" /> {p.text}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate={false}>
          <div className="grid gap-1.5">
            <label htmlFor="cta-email" className="text-[14px] font-medium text-white/90">Work email</label>
            <input id="cta-email" name="email" type="email" required autoComplete="email" placeholder="you@your-organization.org" className={fieldClass} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="cta-org" className="text-[14px] font-medium text-white/90">Organization</label>
            <input id="cta-org" name="org" type="text" required autoComplete="organization" placeholder="e.g. Example Health ACO" className={fieldClass} />
          </div>
          <Button type="submit" size="lg" variant="inverse" className="mt-1 w-full" disabled={status.kind === "sending"}>
            Book a demo <ArrowRight className="h-4 w-4" />
          </Button>
          <p role="status" aria-live="polite" className="min-h-6 text-[14px] text-white/80">
            {status.text || "No patient data in this form. We set up a secure channel for data."}
          </p>
        </form>
      </div>

      <footer className="mt-16 border-t border-white/15 pt-8 lg:mt-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo onDark />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-white/80">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#agents" className="hover:text-white">Agents</a>
            <a href="#demo" className="hover:text-white">Demo</a>
            <a href="#trust" className="hover:text-white">Trust</a>
          </nav>
        </div>
        <p className="mt-6 text-[14px] text-white/60">© {new Date().getFullYear()} CrewHealth.AI · {CONTACT_EMAIL}</p>
        <p className="mt-2 max-w-[70ch] text-[14px] text-white/60">
          Product views on this page show a demo workspace with fictional patients and organizations. HEDIS® is a registered trademark of the National Committee for Quality Assurance (NCQA).
        </p>
      </footer>
    </Scene>
  );
}
