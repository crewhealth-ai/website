import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import HowItWorks from "./sections/HowItWorks";
import Agents from "./sections/Agents";
import AgentDemo from "./sections/AgentDemo";
import Trust from "./sections/Trust";
import Close from "./sections/Close";

export const sections = [
  { id: "top", label: "Overview" },
  { id: "how", label: "How it works" },
  { id: "agents", label: "Agents" },
  { id: "demo", label: "Demo" },
  { id: "trust", label: "Trust" },
  { id: "contact", label: "Book a demo" },
];

export default function App() {
  return (
    <>
      <div className="page-ground" aria-hidden="true" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <ScrollProgress />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <HowItWorks />
        <Agents />
        <AgentDemo />
        <Trust />
        <Close />
      </main>
    </>
  );
}
