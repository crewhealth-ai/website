import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import HowItWorks from "./sections/HowItWorks";
import Agents from "./sections/Agents";
import AgentDemo from "./sections/AgentDemo";
import Trust from "./sections/Trust";
import Close from "./sections/Close";

export default function App() {
  return (
    <>
      <div className="page-ground" aria-hidden="true" />
      {/* Fixed above the header and moved off screen until focused, so it is never covered. */}
      <a
        href="#main"
        className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-md bg-fg px-3 py-2 text-sm text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Navbar />
      <ScrollProgress />
      <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
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
