import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * RiverPond: the still water the river flows into, spanning the full width at the
 * bottom of the page. Choppy wave layers drift across the surface, wavelets
 * bob in the water, soft light rays shimmer below, and the water rises a
 * little as you scroll in. Anything passed as children sits centred in the water.
 */

const WATER = "#10342a";
const WATER_BACK = "#0c271f";
const CREST = "#7fd1b9";
const WAVELET = "rgba(127, 209, 185, 0.22)";

// Pointy-crested waves (like real chop): each crest rises from a flat trough.
function crestsPath(widths: number, heights: number[], base: number) {
  const seg = widths / heights.length;
  let d = `M0 ${base}`;
  heights.forEach((h, i) => {
    const x0 = i * seg;
    const peak = base - h;
    const mid = base - h * 0.45;
    d += ` C${x0 + seg * 0.3} ${base} ${x0 + seg * 0.44} ${mid} ${x0 + seg / 2} ${peak}`;
    d += ` C${x0 + seg * 0.56} ${mid} ${x0 + seg * 0.7} ${base} ${x0 + seg} ${base}`;
  });
  return d;
}

// A repeating wave tile as a CSS background, so it can scroll seamlessly.
function waveTile(w: number, h: number, heights: number[], fill: string, stroke?: string) {
  const base = h - 8;
  const line = crestsPath(w, heights, base);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
    `<path d='${line} V${h} H0Z' fill='${fill}'/>` +
    (stroke
      ? `<path d='${line}' fill='none' stroke='${stroke}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/>`
      : "") +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

const SURFACE_H = 56;
const LAYERS = [
  // far chop: darker, slower, drifting left
  { w: 300, heights: [26, 14, 21, 11], fill: WATER_BACK, stroke: undefined, top: 0, dur: 18, dir: -1 },
  // near chop: body colour with a bright crest line, drifting right
  { w: 270, heights: [16, 30, 12, 24], fill: WATER, stroke: CREST, top: 12, dur: 11, dir: 1 },
] as const;

// squiggly wavelets scattered in the upper water (x/y in % of the water body)
const WAVELETS = [
  { x: 5, y: 7, crests: 7, dur: 6.5, delay: 0 },
  { x: 41, y: 8, crests: 6, dur: 7.5, delay: -2 },
  { x: 77, y: 5, crests: 7, dur: 6, delay: -4 },
  { x: 21, y: 16, crests: 6, dur: 8, delay: -1 },
  { x: 51, y: 14, crests: 6, dur: 7, delay: -3 },
  { x: 70, y: 19, crests: 8, dur: 9, delay: -5 },
  { x: 13, y: 26, crests: 7, dur: 7.5, delay: -2.5 },
  { x: 60, y: 31, crests: 5, dur: 6, delay: -1.5 },
  { x: 86, y: 30, crests: 5, dur: 8.5, delay: -3.5 },
];

function Wavelet({ crests }: { crests: number }) {
  const seg = 26;
  const w = crests * seg;
  const heights = Array.from({ length: crests }, (_, i) => 10 + ((i * 5) % 6));
  return (
    <svg width={w} height="22" viewBox={`0 0 ${w} 22`} className="h-auto w-[clamp(110px,16vw,220px)] overflow-visible">
      <path
        d={crestsPath(w, heights, 19)}
        fill="none"
        stroke={WAVELET}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RiverPond({
  className = "",
  children,
  ...rest
}: {
  className?: string;
  /** content that sits in the water */
  children?: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // the water rises to meet the river as you scroll in
  const rise = useTransform(scrollYProgress, [0, 0.5], ["8vh", "0vh"]);

  return (
    <section ref={ref} {...rest} className={`relative min-h-screen w-full overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-x-0 top-0 -bottom-[8vh]"
        style={{ y: reduced ? 0 : rise }}
      >
        {/* surface: layered chop, gently bobbing */}
        <div className="water-bob absolute inset-x-0 top-0" style={{ height: SURFACE_H + 12 }} aria-hidden="true">
          {LAYERS.map((l, i) => (
            // one tile wider than the screen, sliding exactly one tile per loop (seamless)
            <motion.div
              key={i}
              className="absolute left-0"
              style={{
                top: l.top,
                height: SURFACE_H,
                width: `calc(100% + ${l.w}px)`,
                marginLeft: l.dir > 0 ? -l.w : 0,
                backgroundImage: waveTile(l.w, SURFACE_H, [...l.heights], l.fill, l.stroke),
                backgroundRepeat: "repeat-x",
                backgroundSize: `${l.w}px ${SURFACE_H}px`,
              }}
              animate={reduced ? undefined : { x: [0, l.dir * l.w] }}
              transition={{ duration: l.dur, ease: "linear", repeat: Infinity }}
            />
          ))}
        </div>

        {/* water body */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ top: LAYERS[1].top + SURFACE_H - 1, background: `linear-gradient(to bottom, ${WATER}, #0a1d15 70%)` }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* splash rings where the river pours in */}
            <svg className="absolute left-1/2 top-[3%] -translate-x-1/2" width="220" height="60" viewBox="0 0 220 60">
              {[0, 1.2, 2.4].map((d) => (
                <ellipse
                  key={d}
                  className="pond-ripple"
                  style={{ animationDelay: `${d}s` }}
                  cx="110"
                  cy="22"
                  rx="70"
                  ry="14"
                  fill="none"
                  stroke={CREST}
                  strokeWidth="1.5"
                />
              ))}
            </svg>

            {/* light rays shimmering down through the water */}
            {[12, 38, 63, 84].map((x, i) => (
              <div
                key={x}
                className="water-ray absolute top-0 h-[85%] w-[14%]"
                style={{
                  left: `${x}%`,
                  background: "linear-gradient(to bottom, rgba(214,242,232,0.28), transparent)",
                  animationDelay: `${-i * 1.7}s`,
                  animationDuration: `${7 + i}s`,
                }}
              />
            ))}

            {/* wavelets */}
            {WAVELETS.map((w, i) => (
              <div
                key={i}
                className="wavelet absolute"
                style={{
                  left: `${w.x}%`,
                  top: `${w.y}%`,
                  animationDuration: `${w.dur}s`,
                  animationDelay: `${w.delay}s`,
                }}
              >
                <Wavelet crests={w.crests} />
              </div>
            ))}
          </div>

        </div>
      </motion.div>

      {/* content slot: in normal flow, so the water grows with what it holds */}
      {children && <div className="relative z-10 pt-[clamp(120px,18vh,200px)]">{children}</div>}
    </section>
  );
}

export default RiverPond;
