import { useState } from "react";
import { BEYOND, CERTS, EDUCATION, HACKATHONS, SKILLS } from "@/content";
import { MaskText, Rise } from "@/components/fx/reveal";

/** Skills as a ledger: tools used in the work above carry a dot and say where. */
export function Skills() {
  const [used, setUsed] = useState<{ tool: string; where: string } | null>(null);
  return (
    <section id="skills" aria-labelledby="skills-title" className="chapter shell">
      <MaskText as="h2" id="skills-title" className="display chapter__title" lines={["Skills"]} />
      <p className="chapter__sub">Tools with a dot appear in the work above. Hover or focus one to see where.</p>
      <Rise as="dl" className="ledger">
        {SKILLS.map((g) => (
          <div key={g.group} className="ledger__row">
            <dt>{g.group}</dt>
            <dd>
              <ul className="tools">
                {g.tools.map(([t, where]) =>
                  where ? (
                    <li key={t}>
                      <button
                        type="button"
                        className="tool tool--used"
                        aria-describedby="ledger-used"
                        onMouseEnter={() => setUsed({ tool: t, where })}
                        onFocus={() => setUsed({ tool: t, where })}
                        onMouseLeave={() => setUsed(null)}
                        onBlur={() => setUsed(null)}
                      >
                        {t}
                      </button>
                    </li>
                  ) : (
                    <li key={t} className="tool">
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </dd>
          </div>
        ))}
      </Rise>
      <p className="ledger__used" id="ledger-used" aria-live="polite">
        {used ? (
          <>
            <strong>{used.tool}</strong> is used in {used.where}.
          </>
        ) : (
          " "
        )}
      </p>
    </section>
  );
}

function Entries({ items }: { items: { name: string; text: string; tag?: string }[] }) {
  return (
    <ul className="entries">
      {items.map((it) => (
        <li key={it.name}>
          <strong>
            {it.name}
            {it.tag ? <span className="tag">{it.tag}</span> : null}
          </strong>
          <span>{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function Record() {
  return (
    <section id="record" aria-labelledby="record-title" className="chapter shell">
      <MaskText as="h2" id="record-title" className="display chapter__title" lines={["Record"]} />
      <div className="record">
        <Rise as="article" className="record__edu">
          <h3 className="record__h">Education</h3>
          <p className="record__cgpa">
            {EDUCATION.cgpa}
            <small>/ 10 CGPA</small>
          </p>
          <p className="record__school">{EDUCATION.school}</p>
          <p className="record__muted">
            {EDUCATION.degree} · {EDUCATION.when}
          </p>
          <ul className="entries mt-8">
            {EDUCATION.earlier.map((e) => (
              <li key={e.school}>
                <strong>
                  {e.school}
                  <span className="tag tag--quiet">{e.score}</span>
                </strong>
                <span>
                  {e.what} · {e.when}
                </span>
              </li>
            ))}
          </ul>
        </Rise>
        <div className="record__lists">
          <Rise as="article">
            <h3 className="record__h">Hackathons</h3>
            <Entries items={HACKATHONS} />
          </Rise>
          <Rise as="article" delay={0.05}>
            <h3 className="record__h">Certifications</h3>
            <Entries items={CERTS} />
          </Rise>
          <Rise as="article" delay={0.1}>
            <h3 className="record__h">Beyond the code</h3>
            <Entries items={BEYOND} />
          </Rise>
        </div>
      </div>
    </section>
  );
}
