import { lazy, Suspense } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FACTS } from "@/content";
import { EXPO, MaskText } from "@/components/fx/reveal";
import { Btn } from "./primitives";

const Mountains = lazy(() => import("@/components/ui/mountain-scene"));

/**
 * First viewport: dawn over the valley. The range rises out of flat ground
 * against a lit horizon, the name blooms in letter by letter along the
 * weight axis, then one sentence, two actions, and what he is doing now.
 * As you leave, the name drifts up slower than the page and the range
 * sinks, so the hero hands over to the river instead of cutting.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const nameY = useTransform(scrollY, [0, 800], [0, -80]);
  const fade = useTransform(scrollY, [0, 600], [1, 0]);
  const sink = useTransform(scrollY, [0, 900], [0, 140]);

  return (
    <section id="top" aria-labelledby="hero-name" className="hero relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div className="hero__sky absolute inset-0 -z-20" aria-hidden="true" />
      <motion.div className="hero__scene absolute inset-x-0 bottom-0 top-[26%] -z-10" style={{ y: reduced ? 0 : sink }}>
        <Suspense fallback={null}>
          <Mountains />
        </Suspense>
      </motion.div>

      <div className="shell relative flex flex-1 flex-col justify-end pb-[clamp(28px,6vh,72px)] pt-[clamp(112px,16vh,180px)]">
        <motion.div style={{ y: reduced ? 0 : nameY, opacity: reduced ? 1 : fade }}>
          <MaskText
            as="h1"
            id="hero-name"
            trigger="load"
            delay={0.35}
            stagger={0.045}
            split="chars"
            weight={560}
            label="Krithiv Shankar"
            className="display hero__name"
            lines={["Krithiv ", "Shankar"]}
          />
        </motion.div>

        <div className="mt-[clamp(28px,5vh,56px)] grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EXPO, delay: 1.1 }}
          >
            <p className="lead max-w-[46ch]">
              Computer Science student at SRM IST, Chennai. I build software across computer vision, voice interfaces,
              EdTech and the web, and I like showing how it works.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href="#projects" size="lg">
                See the work
              </Btn>
              <Btn href="#contact" size="lg" variant="outline">
                Contact me
              </Btn>
            </div>
          </motion.div>

          <motion.dl
            className="facts"
            aria-label="At a glance"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: EXPO, delay: 1.35 }}
          >
            {FACTS.map((f) => (
              <div key={f.k} className="facts__row">
                <dt>{f.k}</dt>
                <dd>
                  <strong>{f.v}</strong>
                  <span>{f.s}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      <a href="#statement" className="hero__cue" aria-label="Scroll to the next section">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
