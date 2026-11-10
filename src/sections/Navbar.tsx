import { AnimatePresence, motion, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Logo from "../components/Logo";
import { cn } from "../lib/utils";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#agents", label: "Agents" },
  { href: "#demo", label: "Demo" },
  { href: "#trust", label: "Trust" },
];

/** Solid white bar, 64px, one filled action. Identical at every scroll depth except for a hairline once scrolled. */
export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 24)), [scrollY]);

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-50 border-b bg-surface transition-colors duration-300", scrolled ? "border-line" : "border-transparent")}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-14">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="rounded-full px-4 py-2 text-[15px] font-medium text-muted underline-offset-8 transition-colors hover:text-fg hover:underline">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden lg:block">
            <Button size="sm" href="#contact">Book a demo</Button>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-surface px-6 pb-10 pt-28 lg:hidden"
          >
            <nav className="flex flex-col" aria-label="Mobile">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-4 font-heading text-3xl text-fg">
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-8">
              <Button size="lg" href="#contact" className="w-full" onClick={() => setOpen(false)}>Book a demo</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
