import { useEffect, useRef } from "react";
import { IRONTRONICS, LOGIC_PLAY } from "@/content";
import { initBench } from "@/lib/bench";
import { MaskText, Rise } from "@/components/fx/reveal";
import { Btn } from "./primitives";

const STEPS = ["Capture frame", "Binary segmentation", "Contour tracing", "Find bolt holes", "Measure in mm"];

/** The Irontronics technique, running in the browser on a synthetic part. */
function Bench() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? initBench(ref.current) : undefined), []);
  return (
    <div ref={ref} className="rig">
      <figure className="rig__left">
        <div className="rig__stage">
          <canvas
            id="rig-canvas"
            width={640}
            height={400}
            role="img"
            aria-label="Demo scan of a synthetic metal bracket, showing the current pipeline stage"
          />
          <div className="rig__readout" aria-live="polite" id="rig-readout">
            Press run to scan the part.
          </div>
        </div>
        <figcaption className="rig__note">
          The technique running in your browser on a synthetic part, at a demo scale of 0.5&nbsp;mm per pixel. The real
          project works on live camera frames with manual pixel-to-mm calibration.
        </figcaption>
      </figure>
      <div className="rig__side">
        <ol className="steps" id="rig-steps" aria-label="Pipeline stages">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button type="button" data-step={i} aria-pressed={i === 0}>
                <span className="steps__n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </button>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          <Btn id="rig-run">Run the scan</Btn>
          <Btn id="rig-new" variant="outline">
            New part
          </Btn>
        </div>
        <pre className="measure" id="rig-gcode" tabIndex={0} aria-label="Measurements in millimetres">
          <code>; Measurements appear here after the scan.</code>
        </pre>
      </div>
    </div>
  );
}

export function Experience() {
  return (
    <section id="experience" aria-labelledby="exp-title" className="chapter shell">
      <MaskText as="h2" id="exp-title" className="display chapter__title" lines={["Experience"]} />

      <article className="role" aria-labelledby="iron-title">
        <header className="role__head">
          <MaskText as="h3" id="iron-title" className="display role__title" lines={[IRONTRONICS.title]} />
          <p className="meta">
            <strong>{IRONTRONICS.org}</strong> <span>{IRONTRONICS.role}</span> <span>{IRONTRONICS.when}</span>
          </p>
        </header>
        <Rise>
          <p className="lead max-w-[64ch]">{IRONTRONICS.body}</p>
        </Rise>
        <Rise className="mt-10">
          <Bench />
        </Rise>
        <p className="stackline">
          <span className="sr-only">Stack: </span>
          {IRONTRONICS.stack.join(" · ")}
        </p>
      </article>

      <article className="role role--quiet" aria-labelledby="lp-title">
        <header className="role__head">
          <MaskText as="h3" id="lp-title" className="display role__title" lines={[LOGIC_PLAY.title]} />
          <p className="meta">
            <strong>{LOGIC_PLAY.org}</strong> <span>{LOGIC_PLAY.role}</span> <span>{LOGIC_PLAY.when}</span>
          </p>
        </header>
        <Rise as="ul" className="bullets">
          {LOGIC_PLAY.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </Rise>
      </article>
    </section>
  );
}
