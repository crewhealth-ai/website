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
  signals: string[];
  actions: string[];
  measures: string[];
  size?: "lg" | "md";
};

export const agents: Agent[] = [
  {
    name: "Care Gap Closure Agent",
    short: "Finds and closes open quality gaps",
    description:
      "Reconciles claims, EHR and lab data against HEDIS, eCQM and MIPS specifications, then runs outreach by text, phone and mail until each gap is closed and documented.",
    icon: ClipboardCheck,
    signals: ["Claims", "EHR via FHIR", "Lab results"],
    actions: ["Drafts outreach (SMS, voice, mail)", "Books appointments", "Confirms closure evidence"],
    measures: ["HbA1c control", "Colorectal screening", "BP control", "Breast cancer screening"],
    size: "lg",
  },
  {
    name: "Transitions of Care Agent",
    short: "Owns the 30 days after discharge",
    description:
      "Watches ADT feeds for discharges, reaches the patient within two business days, reconciles medications and books the follow-up visit that qualifies for TCM billing.",
    icon: Route,
    signals: ["HL7 ADT", "Discharge summaries", "Pharmacy fills"],
    actions: ["2-day interactive contact", "Med reconciliation prompts", "7/14-day visit scheduling"],
    measures: ["30-day readmissions", "TCM 99495 / 99496", "Follow-up rate"],
    size: "lg",
  },
  {
    name: "Rising-Risk Agent",
    short: "Spots patients before the ED does",
    description:
      "Scores patients daily for admission and ED risk, explains the drivers and routes them to care management with a suggested plan.",
    icon: HeartPulse,
    signals: ["Utilization trend", "Social needs", "Vitals and labs"],
    actions: ["Prioritized worklists", "Driver explanations", "Care plan drafts"],
    measures: ["ED visits / 1,000", "Admits / 1,000", "Care management enrollment"],
  },
  {
    name: "Preventive Visit Agent",
    short: "Fills preventive and wellness visit schedules",
    description:
      "Finds every patient due for a preventive or wellness visit, runs outreach in the patient's language and completes the health risk assessment ahead of the visit.",
    icon: CalendarCheck,
    signals: ["Eligibility", "Visit history", "Patient preferences"],
    actions: ["Multilingual outreach", "Pre-visit HRA", "Provider pre-charting"],
    measures: ["AWV completion", "Open slots filled", "No-show rate"],
  },
  {
    name: "Documentation Integrity Agent",
    short: "Condition suspects with the evidence attached",
    description:
      "Surfaces chronic conditions with supporting clinical evidence and queries providers at the point of care. It never codes without documentation.",
    icon: FileSearch,
    signals: ["Problem lists", "Medications", "Clinical notes"],
    actions: ["Provider queries with evidence", "Recapture reminders", "Audit trail"],
    measures: ["Recapture rate", "Documentation accuracy", "Query turnaround"],
  },
  {
    name: "Quality Reporting Agent",
    short: "Measures reconciled and ready to submit",
    description:
      "Aggregates numerators and denominators across sources, flags exclusions and conflicts, and assembles the APP and eCQM package before the window closes.",
    icon: Stethoscope,
    signals: ["Multi-EHR data", "Registry feeds", "Claims"],
    actions: ["Measure reconciliation", "Data quality fixes", "Submission package"],
    measures: ["APP measures", "eCQM rates", "Data completeness"],
  },
  {
    name: "Referral Agent",
    short: "Keeps care inside the network",
    description:
      "Detects out-of-network leakage by specialty and referrer and suggests in-network alternatives at the moment of referral.",
    icon: Activity,
    signals: ["Referral orders", "Claims by provider", "Network roster"],
    actions: ["Leakage alerts", "Referral suggestions", "Provider scorecards"],
    measures: ["In-network share", "Referral turnaround", "Specialist cost variance"],
  },
  {
    name: "Financial Performance Agent",
    short: "Cost, utilization and contract performance, forecast monthly",
    description:
      "Tracks cost and utilization against budget or benchmark by month, models each initiative and shows finance where the next dollar of savings is likely to come from.",
    icon: BadgeDollarSign,
    signals: ["Benchmark", "Expenditure trend", "Initiative pipeline"],
    actions: ["Monthly forecast", "Scenario modeling", "Board-ready reports"],
    measures: ["Savings rate", "PMPM trend", "Quality score impact"],
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
    patient: "M. Lopez, 72 · CHF · discharged from Mercy General",
    outcome: "TCM visit booked within 7 days. Readmission risk reduced from 0.81 to 0.34.",
    steps: [
      { actor: "system", title: "ADT discharge event received", detail: "A03 message from Mercy General at 14:12. Primary dx I50.23, 4-day stay." },
      { actor: "agent", title: "Risk scored and drivers explained", detail: "30-day readmission risk 0.81. Drivers: two prior CHF admits, 11 active meds, lives alone." },
      { actor: "agent", title: "Outreach drafted in Spanish", detail: "Voice + SMS script prepared with symptom check, weight-monitoring reminder, and scheduling link." },
      { actor: "human", title: "RN care manager reviews and approves", detail: "Added a note about the new diuretic dose. Approved outreach in 40 seconds." },
      { actor: "agent", title: "Patient reached, visit scheduled", detail: "Interactive contact logged day 1. Follow-up with PCP booked for Tuesday 10:40." },
      { actor: "system", title: "TCM 99496 documentation assembled", detail: "Contact date, med reconciliation, and visit evidence packaged for billing review." },
    ],
  },
  {
    id: "gap",
    name: "Care gap outreach",
    agent: "Care Gap Closure Agent",
    patient: "Primary care panel · 1,284 open colorectal screening gaps",
    outcome: "412 screenings scheduled in 3 weeks. Measure rate up 9.1 points.",
    steps: [
      { actor: "system", title: "Monthly claims and FHIR refresh", detail: "Measure engine re-evaluated 18,920 patients against HEDIS COL-E." },
      { actor: "agent", title: "Gap list reconciled", detail: "Removed 96 false gaps with colonoscopy evidence found in outside records. 1,284 remain." },
      { actor: "agent", title: "Outreach sequenced by likelihood to act", detail: "SMS first for patients with portal activity, voice for others, FIT kit mail-out for rural ZIPs." },
      { actor: "human", title: "Quality lead approves campaign", detail: "Adjusted messaging for one practice. Approved for 1,284 patients." },
      { actor: "agent", title: "Appointments and kits confirmed", detail: "412 screenings scheduled, 318 FIT kits mailed, 54 patients opted out and logged." },
      { actor: "system", title: "Closure evidence written back", detail: "Results posted to the registry; dashboard updated with supplemental data." },
    ],
  },
  {
    id: "doc",
    name: "Documentation query",
    agent: "Documentation Integrity Agent",
    patient: "J. Patel, 68 · AWV scheduled Thursday",
    outcome: "Two conditions documented with evidence. Zero unsupported codes.",
    steps: [
      { actor: "system", title: "AWV appears on Thursday's schedule", detail: "Pre-visit review triggered 72 hours ahead." },
      { actor: "agent", title: "Evidence gathered", detail: "Found insulin fills, eGFR 44 twice in 12 months, and a nephrology consult note." },
      { actor: "agent", title: "Two suspects queried with citations", detail: "CKD stage 3b and diabetes with CKD, each linked to the source labs and notes." },
      { actor: "human", title: "PCP reviews at point of care", detail: "Confirmed both, declined a third suspect the agent had marked low confidence." },
      { actor: "agent", title: "Documentation template prepared", detail: "Assessment and plan language drafted for the clinician to edit and sign." },
      { actor: "system", title: "Audit trail stored", detail: "Query, evidence, and clinician decision retained for compliance review." },
    ],
  },
];
