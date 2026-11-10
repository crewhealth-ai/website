import { AnimatePresence, motion, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 24)), [scrollY]);

  // While the menu is open it behaves as a dialog: the page behind it is inert and does not scroll,
  // focus starts on the first link, and Escape closes it and returns focus to the menu button.
  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("main");
    main?.setAttribute("inert", "");
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    menu.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      main?.removeAttribute("inert");
      html.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-50 border-b bg-surface transition-colors duration-300", scrolled ? "border-line" : "border-transparent")}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-5 sm:px-8 lg:px-14">
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
          <div className="flex items-center gap-2 lg:hidden">
            <Button size="sm" href="#contact" className="hidden px-3 min-[380px]:inline-flex" onClick={() => setOpen(false)}>Book a demo</Button>
            <button
              ref={toggle}
              className="grid h-11 w-11 place-items-center rounded-full border border-line"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menu}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-surface lg:hidden"
          >
            {/* min-h-full keeps the links at the bottom on tall screens and lets them scroll on short ones. */}
            <div className="flex min-h-full flex-col justify-end px-6 pt-24 pb-10">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
