import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Cursor: adapted from the 21st.dev "Custom Cursor" (soralabs): a pointer
 * that follows with spring physics and morphs into a larger ring over
 * interactive targets. Changes for this site:
 * - a precise dot rides the real pointer position (no lag where it matters),
 *   and only the ring trails on a spring;
 * - targets are found by delegation (links, buttons, tabs, [data-cursor]),
 *   so no wrapper components are needed;
 * - [data-cursor="Open"] shows a short label inside the ring;
 * - fine pointers only, never under reduced motion; the native cursor
 *   returns the moment the pointer leaves the window.
 */

const TARGETS = 'a, button, [role="tab"], [data-cursor], label, summary';
const EASE = [0.625, 0.05, 0, 1] as const;

export function Cursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<{ hover: boolean; label: string; down: boolean; visible: boolean }>({
    hover: false,
    label: "",
    down: false,
    visible: false,
  });

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches && !reduced);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setState((s) => (s.visible ? s : { ...s, visible: true }));
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(TARGETS) as HTMLElement | null;
      const hover = !!el && !(el as HTMLButtonElement).disabled;
      const label = el?.dataset.cursor ?? "";
      setState((s) => (s.hover === hover && s.label === label ? s : { ...s, hover, label }));
    };
    const down = () => setState((s) => ({ ...s, down: true }));
    const up = () => setState((s) => ({ ...s, down: false }));
    const leave = () => setState((s) => ({ ...s, visible: false }));

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-cursor");
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = state.label ? 64 : state.hover ? 44 : 30;
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[120] flex items-center justify-center rounded-full"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        initial={false}
        animate={{
          width: size,
          height: size,
          // a labelled ring steps aside so the link text under the pointer stays readable
          left: state.label ? 38 : 0,
          top: state.label ? 34 : 0,
          opacity: state.visible ? 1 : 0,
          scale: state.down ? 0.86 : 1,
          backgroundColor: state.label ? "rgba(178, 230, 210, 0.92)" : state.hover ? "rgba(127, 209, 185, 0.12)" : "rgba(127, 209, 185, 0)",
          borderColor: state.label ? "rgba(178, 230, 210, 0)" : state.hover ? "rgba(127, 209, 185, 0.9)" : "rgba(231, 239, 227, 0.35)",
        }}
        transition={{ duration: 0.38, ease: EASE }}
      >
        <motion.span
          className="text-[11px] font-semibold uppercase tracking-[0.06em] text-green-950"
          initial={false}
          animate={{ opacity: state.label ? 1 : 0, y: state.label ? 0 : 6 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {state.label}
        </motion.span>
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[121] size-[6px] rounded-full bg-green-50"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        initial={false}
        animate={{ opacity: state.visible ? 1 : 0, scale: state.hover ? 0.6 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}

export default Cursor;
