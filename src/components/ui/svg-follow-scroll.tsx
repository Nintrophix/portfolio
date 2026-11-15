import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * River (Skiper19, valley edition): a stroke that follows the scroll.
 * It springs from the foot of the mountain hero and runs down behind the
 * whole body of the page, drawn as far as the reader has descended, and
 * pours into the pond that holds the contact section.
 * Rendered as an absolute backdrop inside its parent, behind the content.
 */

// River course, normalised 0..1 (x across, y down the parent). It keeps to
// the margins where the text is lightest and crosses between chapters.
const COURSE: [number, number][] = [
  [0.5, 0],
  [0.44, 0.025],
  [0.1, 0.07],
  [0.05, 0.15],
  [0.07, 0.22],
  [0.93, 0.3],
  [0.95, 0.4],
  [0.9, 0.47],
  [0.06, 0.55],
  [0.04, 0.66],
  [0.1, 0.72],
  [0.95, 0.8],
  [0.97, 0.9],
  [0.93, 0.965],
  [0.62, 0.99],
  [0.5, 1],
];

// Smooth curve through the points (Catmull-Rom converted to cubic Béziers).
function riverPath(w: number, h: number) {
  const pts = COURSE.map(([x, y]) => [x * w, y * h] as const);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const EDGE_FADE = "linear-gradient(to bottom, transparent 0, #000 12vh)";

const Skiper19 = ({ className = "" }: { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const reduced = useReducedMotion();

  // drawn from when the parent's top passes 70% of the viewport to when its
  // bottom reaches the bottom of the viewport
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end end"] });
  const eased = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const shown = useTransform(scrollYProgress, [0, 0.01], [0, 1]);
  const pathLength = reduced ? 1 : eased;
  const opacity = reduced ? 1 : shown;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = useMemo(() => (size.w && size.h ? riverPath(size.w, size.h) : ""), [size.w, size.h]);

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {d && (
        <motion.svg
          style={{ opacity, maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.w} ${size.h}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="river-flow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={size.h}>
              <stop offset="0" stopColor="#d6f2e8" />
              <stop offset="0.2" stopColor="#7fd1b9" />
              <stop offset="1" stopColor="#4fa58f" />
            </linearGradient>
            <filter id="river-glow" x="-20%" y="-2%" width="140%" height="104%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
            {/* only the drawn part of the river carries the current */}
            <mask id="river-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width={size.w} height={size.h}>
              <motion.path d={d} stroke="#fff" strokeWidth="12" strokeLinecap="butt" style={{ pathLength }} />
            </mask>
          </defs>

          {/* the light the water throws on the valley floor */}
          <motion.path className="river-glow" d={d} stroke="#7fd1b9" strokeOpacity="0.14" strokeWidth="20" strokeLinecap="round" filter="url(#river-glow)" style={{ pathLength }} />
          {/* the river */}
          <motion.path d={d} stroke="url(#river-flow)" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" style={{ pathLength }} />
          {/* current: glints drifting downstream, only where the river is drawn */}
          <g mask="url(#river-reveal)">
            <path d={d} className="river-current" stroke="#effaf5" strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 90" />
          </g>
        </motion.svg>
      )}
    </div>
  );
};

export { Skiper19 };
