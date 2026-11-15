import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Squared button with the rolling label from the design system. */
export function Btn({
  children,
  href,
  variant = "solid",
  size = "md",
  className,
  ...rest
}: {
  children: string;
  href?: string;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>, "children">) {
  const cls = cn("btn", `btn--${variant}`, `btn--${size}`, className);
  const inner = (
    <span className="btn__roll">
      <span className="btn__txt" data-roll>
        {children}
      </span>
      <span className="btn__txt btn__txt--next" data-roll aria-hidden="true">
        {children}
      </span>
    </span>
  );
  if (href)
    return (
      <a className={cls} href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  return (
    <button type="button" className={cls} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}

/** Section title: wide caps, masked rise. */
export { MaskText } from "@/components/fx/reveal";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Nav label that scrambles into place on hover (and once on load). */
export function Scramble({ text, playOnMount = 0 }: { text: string; playOnMount?: number }) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  const run = (duration = 420) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const fixed = Math.floor(text.length * t);
      setOut(text.split("").map((c, k) => (k < fixed || c === " " ? c : GLYPHS[(Math.random() * 26) | 0])).join(""));
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => {
    if (!playOnMount) return;
    const id = setTimeout(() => run(600), playOnMount);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span onMouseEnter={() => run()} className="scramble">
      <span aria-hidden="true">{out}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

export function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("icon", className)}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

/** Small external link used on projects and contact. */
export function OutLink({ href, children, icon }: { href: string; children: ReactNode; icon: "github" | "live" }) {
  return (
    <a className="outlink" href={href} target="_blank" rel="noopener noreferrer" data-cursor="Open">
      {icon === "github" ? <GitHubIcon /> : <ArrowIcon />}
      <span>{children}</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
