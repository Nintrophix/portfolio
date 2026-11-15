import { useRef, useState } from "react";
import { CONTACT } from "@/content";
import { MaskText, Rise } from "@/components/fx/reveal";
import RiverPond from "@/components/ui/river-pond";
import { ArrowIcon, Btn } from "./primitives";

/** The river ends here: contact and footer sit in the still water. */
export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: CONTACT.email });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <RiverPond id="contact" aria-labelledby="contact-title" className="-mt-px">
      <div className="shell pb-10">
        <MaskText
          as="h2"
          id="contact-title"
          className="display contact__title"
          lines={["Let's get in touch"]}
        />
        <Rise className="contact__grid">
          <div>
            <p className="lead">Email is the quickest way to reach me.</p>
            <div className="contact__mail">
              <a className="contact__email" href={`mailto:${CONTACT.email}`} data-cursor="Write">
                {CONTACT.email}
              </a>
              <Btn size="sm" variant="outline" onClick={copy} aria-describedby="copy-status">
                {copied ? "Copied" : "Copy"}
              </Btn>
              <span id="copy-status" className="sr-only" role="status" aria-live="polite">
                {copied ? "Email copied to your clipboard" : ""}
              </span>
            </div>
          </div>
          <ul className="contact__links">
            <li>
              <a href={CONTACT.github.href} target="_blank" rel="noopener noreferrer">
                <span className="contact__k">GitHub</span>
                <strong>{CONTACT.github.label}</strong>
                <ArrowIcon className="contact__arrow" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.linkedin.href} target="_blank" rel="noopener noreferrer">
                <span className="contact__k">LinkedIn</span>
                <strong>{CONTACT.linkedin.label}</strong>
                <ArrowIcon className="contact__arrow" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.resume} download>
                <span className="contact__k">Résumé</span>
                <strong>Download PDF</strong>
                <ArrowIcon className="contact__arrow contact__arrow--down" />
              </a>
            </li>
          </ul>
        </Rise>

        <footer className="footer">
          <p className="footer__mark" aria-hidden="true">
            Krithiv Shankar
          </p>
          <div className="footer__row">
            <p>Built by Krithiv Shankar, Chennai.</p>
            <a href="#top">Back to top</a>
          </div>
        </footer>
      </div>
      <div className="toast" data-on={copied || undefined} aria-hidden="true">
        Email copied to your clipboard
      </div>
    </RiverPond>
  );
}
