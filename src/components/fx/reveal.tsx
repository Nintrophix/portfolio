import { motion, useInView, useReducedMotion } from "framer-motion";
import { createElement, useRef, type ReactNode } from "react";

/**
 * Weight bloom: the page's text reveal. Instead of sliding text out of a
 * mask, each word (or letter, for the name) opens up along Archivo's
 * variable weight axis, from a hairline 150 to its resting weight, while
 * it comes into focus. Nothing moves position, so nothing shifts the layout
 * around it; the type itself does the arriving.
 * Timing follows the scroll-step reveal of the 21st.dev Cinematic Product
 * Scroll Section: one long expo ease, small stagger.
 */

export const EXPO = [0.16, 1, 0.3, 1] as const;

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

export function MaskText({
  lines,
  as = "div",
  className = "",
  delay = 0,
  stagger = 0.06,
  trigger = "view",
  split = "words",
  weight = 560,
  label,
  id,
}: {
  lines: ReactNode[];
  as?: Tag;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  trigger?: "view" | "load";
  /** "chars" for short display text such as the name */
  split?: "words" | "chars";
  /** resting weight on the wght axis */
  weight?: number;
  label?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const play = trigger === "load" || inView;

  // flatten lines into pieces, remembering which line each belongs to
  let n = 0;
  const content = lines.map((line, li) => {
    if (typeof line !== "string") {
      return (
        <span key={li} className="bloom-line">
          {line}
        </span>
      );
    }
    const piece = (p: string, key: number) => {
      const i = n++;
      return (
        <motion.span
          key={key}
          className="bloom"
          aria-hidden={label ? true : undefined}
          initial={reduced ? false : ({ opacity: 0, filter: "blur(8px)", "--w": 150 } as never)}
          animate={play ? ({ opacity: 1, filter: "blur(0px)", "--w": weight } as never) : undefined}
          style={{ "--w": weight } as never}
          transition={{ duration: 1.6, ease: EXPO, delay: delay + i * stagger }}
        >
          {p}
        </motion.span>
      );
    };
    return (
      <span key={li} className="bloom-line">
        {line.split(/(\s+)/).map((word, wi) => {
          if (!word) return null;
          if (/^\s+$/.test(word)) return word;
          if (split === "words") return piece(word, wi);
          // letters stay together inside their word, so a line never breaks mid-word
          return (
            <span key={wi} className="whitespace-nowrap">
              {Array.from(word).map((c, ci) => piece(c, ci))}
            </span>
          );
        })}
      </span>
    );
  });

  return createElement(as, { ref, className, id, "aria-label": label }, content);
}

/** Quiet companion for supporting copy: fades up once, from a small offset. */
export function Rise({
  children,
  className = "",
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "ul" | "ol" | "li" | "dl" | "article" | "header";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: EXPO, delay }}
    >
      {children}
    </Comp>
  );
}
