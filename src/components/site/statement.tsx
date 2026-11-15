import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TURNS } from "@/content";

/**
 * The one sentence the page is about, told while the visitor holds still.
 * Text behaviour from the 21st.dev Cinematic Product Scroll Section: the
 * section pins, and each clause steps in at its own scroll threshold
 * (there: data-progress 0.2 / 0.4 / 0.6). Here a clause starts as a faint
 * ghost, already readable, and resolves to full ink as its turn comes.
 * Narrow screens and reduced motion get the plain, unpinned sentence.
 */

const STARTS = [0.12, 0.38, 0.64];

function Clause({ i, progress, pinned }: { i: number; progress: MotionValue<number>; pinned: boolean }) {
  const t = TURNS[i];
  const a = STARTS[i];
  const reduced = useReducedMotion();
  // the clause gains weight and ink as its turn comes: a scroll-driven weight bloom
  const opacity = useTransform(progress, [a, a + 0.16], [0.28, 1]);
  const w = useTransform(progress, [a, a + 0.18], [180, 520]);
  const line = useTransform(progress, [a + 0.06, a + 0.22], [0, 1]);

  const body = (
    <>
      <span className="turn__from">{t.from}</span> <span className="turn__into">into</span>{" "}
      <span className="turn__to">{t.to}</span>
      <span className="turn__where">
        <motion.span className="turn__rule" style={pinned ? { scaleX: line } : undefined} aria-hidden="true" />
        {t.where}
      </span>
    </>
  );

  if (!pinned)
    return (
      <motion.li
        className="turn"
        initial={reduced ? false : ({ opacity: 0.28, "--w": 180 } as never)}
        whileInView={{ opacity: 1, "--w": 520 } as never}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {body}
      </motion.li>
    );
  return (
    <motion.li className="turn" style={{ opacity, "--w": w } as never}>
      {body}
    </motion.li>
  );
}

export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(min-width: 768px) and (min-height: 560px)");
    const u = () => setWide(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);
  const pinned = wide && !reduced;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="statement" ref={ref} aria-labelledby="statement-title" className={pinned ? "statement statement--pinned" : "statement"}>
      <div className="statement__stage shell">
        <h2 id="statement-title" className="statement__lead">
          I build software that turns
        </h2>
        <ol className="turns">
          {TURNS.map((_, i) => (
            <Clause key={i} i={i} progress={scrollYProgress} pinned={pinned} />
          ))}
        </ol>
      </div>
    </section>
  );
}
