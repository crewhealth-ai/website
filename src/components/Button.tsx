import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/utils";

type Variant = "primary" | "secondary" | "onDark" | "inverse";
type Size = "sm" | "md" | "lg";

/* One filled style marks the main action; one outlined style for everything secondary. No shadows. */
const variants: Record<Variant, string> = {
  primary: "bg-action text-white hover:bg-action-hover active:translate-y-px",
  secondary: "border border-line-strong bg-surface text-fg hover:border-fg active:translate-y-px",
  onDark: "border border-white/30 bg-transparent text-white hover:bg-white/10 active:translate-y-px",
  inverse: "bg-white text-primary-900 hover:bg-primary-soft active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[14px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-[16px]",
};

type Props = {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "children"> &
  Omit<ComponentProps<"a">, "children">;

export default function Button({ variant = "primary", size = "md", href, className, children, ...rest }: Props) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-heading font-medium whitespace-nowrap transition-[background-color,border-color,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    return (
      <a href={href} className={classes} {...(rest as ComponentProps<"a">)}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
