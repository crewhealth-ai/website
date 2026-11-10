import {
  Activity,
  BadgeDollarSign,
  CalendarCheck,
  ClipboardCheck,
  FileSearch,
  HeartPulse,
  Route,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export type Agent = {
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
};

export const agents: Agent[] = [
  {
    name: "Care Gap Closure Agent",
    short: "Finds and closes open quality gaps",
    description:
      "Reconciles claims, EHR and lab data against HEDIS®, eCQM and MIPS specifications, then runs outreach by text, phone and mail and documents each gap it closes.",
    icon: ClipboardCheck,
  },
  {
    name: "Transitions of Care Agent",
    short: "Owns the 30 days after discharge",
    description:
      "Watches ADT feeds for discharges, gets the care team in touch with the patient within two business days, prepares medication reconciliation and books the follow-up visit inside the TCM window.",
    icon: Route,
  },
  {
    name: "Rising-Risk Agent",
    short: "Spots patients before the ED does",
    description:
      "Scores patients daily for admission and ED risk, explains the drivers and routes them to care management with a suggested plan.",
    icon: HeartPulse,
  },
  {
    name: "Preventive Visit Agent",
    short: "Fills preventive and wellness visit schedules",
    description:
      "Finds every patient due for a preventive or wellness visit, runs outreach in the patient's language and completes the health risk assessment ahead of the visit.",
    icon: CalendarCheck,
  },
  {
    name: "Documentation Integrity Agent",
    short: "Condition suspects with the evidence attached",
    description:
      "Surfaces chronic conditions with supporting clinical evidence and queries providers at the point of care. It never codes without documentation.",
    icon: FileSearch,
  },
  {
    name: "Quality Reporting Agent",
    short: "Measures reconciled and ready to submit",
    description:
      "Aggregates numerators and denominators across sources, flags exclusions and conflicts, and assembles the APP and eCQM package before the window closes.",
    icon: Stethoscope,
  },
  {
    name: "Referral Agent",
    short: "Keeps care inside the network",
    description:
      "Detects out-of-network leakage by specialty and referrer and suggests in-network alternatives at the moment of referral.",
    icon: Activity,
  },
  {
    name: "Financial Performance Agent",
    short: "Cost, utilization and contract performance, forecast monthly",
    description:
      "Tracks cost and utilization against budget or benchmark by month, models each initiative and shows finance where the next dollar of savings is likely to come from.",
    icon: BadgeDollarSign,
  },
];

export type DemoStep = {
  actor: "agent" | "system" | "human";
  title: string;
  detail: string;
};

export type DemoScenario = {
  id: string;
  name: string;
  agent: string;
  patient: string;
  outcome: string;
  steps: DemoStep[];
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "toc",
    name: "Post-discharge follow-up",
    agent: "Transitions of Care Agent",
    patient: "M. López, 72 · CHF · discharged from Quillmont General",
    outcome: "Patient reached on day 1 and PCP visit booked for day 6, inside the TCM window.",
    steps: [
      { actor: "system", title: "ADT discharge event received", detail: "A03 message from Quillmont General at 14:12. Primary dx I50.23, 4-day stay." },
      { actor: "agent", title: "Risk scored and drivers explained", detail: "Readmission risk score 0.81 (high). Drivers: two prior CHF admits, 11 active meds, lives alone." },
      { actor: "agent", title: "Outreach drafted in Spanish", detail: "Voice + SMS script prepared with a symptom check, a daily-weight reminder and a visit time to confirm." },
      { actor: "human", title: "RN care manager reviews and approves", detail: "Reviews the drafted outreach and adds a note about the new diuretic dose." },
      { actor: "agent", title: "Patient reached, visit booked", detail: "Patient replied on day 1 and RN Ortiz completed the follow-up call. PCP visit booked for Tuesday 10:40." },
      { actor: "system", title: "TCM checklist started", detail: "Discharge date, contact date and medication reconciliation recorded. The PCP adds the visit note and complexity level after Tuesday's visit." },
    ],
  },
  {
    id: "gap",
    name: "Care gap outreach",
    agent: "Care Gap Closure Agent",
    patient: "Primary care network · 1,284 open colorectal screening gaps",
    outcome: "412 screenings scheduled and 318 FIT kits mailed in 3 weeks. The measure rate updates as results come back.",
    steps: [
      { actor: "system", title: "Monthly claims and FHIR refresh", detail: "Measure engine re-evaluated 18,920 patients against HEDIS COL-E." },
      { actor: "agent", title: "Gap list reconciled", detail: "Removed 96 false gaps with colonoscopy evidence found in outside records. 1,284 remain." },
      { actor: "agent", title: "Outreach sequenced by likelihood to act", detail: "SMS first for patients with portal activity, voice for others, FIT kit mail-out for rural ZIPs." },
      { actor: "human", title: "Quality RN lead approves campaign", detail: "Adjusts the messaging for one practice and approves the campaign for 1,284 patients." },
      { actor: "agent", title: "Appointments and kits confirmed", detail: "412 screenings scheduled, 318 FIT kits mailed, 54 patients opted out and logged." },
      { actor: "system", title: "Registry updated", detail: "Scheduled screenings and mailed kits logged. Each gap closes when its result comes back." },
    ],
  },
  {
    id: "doc",
    name: "Documentation query",
    agent: "Documentation Integrity Agent",
    patient: "J. Patel, 68 · AWV scheduled Thursday",
    outcome: "The PCP confirmed two conditions at the visit, each with its evidence on file, and declined a third.",
    steps: [
      { actor: "system", title: "AWV appears on Thursday's schedule", detail: "Pre-visit review triggered 72 hours ahead." },
      { actor: "agent", title: "Evidence gathered", detail: "Found insulin fills, eGFR 44 twice in 12 months, and a nephrology consult note." },
      { actor: "agent", title: "Two suspects queried with citations", detail: "CKD stage 3b and diabetes with CKD, each linked to the source labs and notes." },
      { actor: "human", title: "PCP reviews at point of care", detail: "Confirms both conditions and declines a third suspect the agent marked low confidence." },
      { actor: "agent", title: "Documentation template prepared", detail: "Assessment and plan language drafted for the clinician to edit and sign." },
      { actor: "system", title: "Audit trail stored", detail: "Query, evidence, and clinician decision retained for compliance review." },
    ],
  },
];
