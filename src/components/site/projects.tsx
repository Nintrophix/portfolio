import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { PROJECTS } from "@/content";
import { EXPO, MaskText, Rise } from "@/components/fx/reveal";
import { OutLink } from "./primitives";

/** Pipeline whose stages light one after another while it is on screen. */
function Pipe({ label, steps }: { label: string; steps: string[][] }) {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduced = useReducedMotion();
  const [k, setK] = useState(-1);
  useEffect(() => {
    if (!inView || reduced) return;
    let i = 0;
    setK(0);
    const id = setInterval(() => setK((i = (i + 1) % steps.length)), 950);
    return () => clearInterval(id);
  }, [inView, reduced, steps.length]);
  return (
    <ol ref={ref} className="pipe" aria-label={label}>
      {steps.map(([a, b], i) => (
        <li key={a} data-on={i === k || undefined}>
          <span className="pipe__k">{a}</span>
          <strong>{b}</strong>
        </li>
      ))}
    </ol>
  );
}

const DECODER = [
  {
    tab: "Read",
    code: (
      <>
        {`Traceback (most recent call last):\n  File "quest.py", line 4, in <module>\n    print(totl)\n`}
        <span className="hl">
          <span className="k">NameError</span>: name 'totl' is not defined
        </span>
      </>
    ),
    say: (
      <>
        Start at the bottom. The last line names the error type and what went wrong: Python cannot find anything called{" "}
        <code>totl</code>.
      </>
    ),
  },
  {
    tab: "Decode",
    code: (
      <>
        <span className="g">1</span>
        {"  prices = ["}
        <span className="y">120</span>, <span className="y">80</span>, <span className="y">45</span>
        {"]\n"}
        <span className="g">2</span>
        {"  total = sum(prices)\n"}
        <span className="g">3</span>
        {"\n"}
        <span className="hl">
          <span className="g">4</span>
          {"  print(totl)"}
        </span>
      </>
    ),
    say: (
      <>
        The traceback points at line 4. A NameError means that name was never created. Compare it with the one that was:{" "}
        <code>total</code>, on line 2.
      </>
    ),
  },
  {
    tab: "Fix",
    code: (
      <>
        <span className="g">1</span>
        {"  prices = ["}
        <span className="y">120</span>, <span className="y">80</span>, <span className="y">45</span>
        {"]\n"}
        <span className="g">2</span>
        {"  total = sum(prices)\n"}
        <span className="g">3</span>
        {"\n"}
        <span className="ok">
          <span className="g">4</span>
          {"  print(total)"}
        </span>
        {"\n\n"}
        <span className="g">{">>>"}</span> 245
      </>
    ),
    say: <>Fix the typo and run it again. The error is gone and the program prints 245. Read, decode, fix: the same loop works in every language.</>,
  },
];

/** Debug Odyssey's read / decode / fix habit, as an accessible tab set. */
function Decoder() {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const go = (n: number, focus = false) => {
    const next = (n + DECODER.length) % DECODER.length;
    setI(next);
    if (focus) tabs.current[next]?.focus();
  };
  return (
    <div className="decoder">
      <div className="decoder__tabs" role="tablist" aria-label="Debugging steps">
        {DECODER.map((d, k) => (
          <button
            key={d.tab}
            ref={(el) => {
              tabs.current[k] = el;
            }}
            role="tab"
            id={`dt-${k}`}
            aria-controls="dp"
            aria-selected={k === i}
            tabIndex={k === i ? 0 : -1}
            onClick={() => go(k)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(i + 1, true);
              if (e.key === "ArrowLeft") go(i - 1, true);
            }}
          >
            {d.tab}
          </button>
        ))}
      </div>
      <div className="decoder__panel" id="dp" role="tabpanel" aria-labelledby={`dt-${i}`}>
        <motion.pre
          key={i}
          className="code"
          initial={reduced ? false : { opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: EXPO }}
        >
          {DECODER[i].code}
        </motion.pre>
        <p className="decoder__say">{DECODER[i].say}</p>
      </div>
      <p className="decoder__note">An example of the read, decode, fix habit the platform trains.</p>
    </div>
  );
}

/** Pointer-tracked light on each project: a soft jade glow under the cursor. */
function useLight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

function Project({ p }: { p: (typeof PROJECTS)[number] }) {
  const ref = useLight<HTMLElement>();
  return (
    <article ref={ref} id={p.id} className="project" aria-labelledby={`${p.id}-title`}>
      <div className="project__light" aria-hidden="true" />
      <header className="project__head">
        <MaskText as="h3" id={`${p.id}-title`} className="display project__name" lines={[p.name]} />
        <div className="project__aside">
          <p className="meta">
            <strong>{p.kind}</strong> <span>{p.when}</span>
            {"note" in p && p.note ? <span className="tag">{p.note}</span> : null}
          </p>
          <p className="project__links">
            {p.links.map((l) => (
              <OutLink key={l.href} href={l.href} icon={l.kind}>
                {l.label}
              </OutLink>
            ))}
          </p>
        </div>
      </header>
      <div className={p.id === "odyssey" ? "project__body project__body--split" : "project__body"}>
        <Rise>
          <p className="lead">{p.body}</p>
        </Rise>
        {p.id === "odyssey" ? (
          <Rise delay={0.1}>
            <Decoder />
          </Rise>
        ) : null}
      </div>
      {"pipe" in p && p.pipe ? <Pipe label={p.pipe.label} steps={p.pipe.steps} /> : null}
      <p className="stackline">
        <span className="sr-only">Stack: </span>
        {p.stack.join(" · ")}
      </p>
    </article>
  );
}

export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="chapter shell">
      <MaskText as="h2" id="projects-title" className="display chapter__title" lines={["Projects"]} />
      <div className="projects">
        {PROJECTS.map((p) => (
          <Project key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
