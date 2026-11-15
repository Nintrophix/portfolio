import { useEffect, useRef, useState } from "react";
import { NAV } from "@/content";
import { Btn, Scramble } from "./primitives";

/**
 * Top bar: slips away while you read downwards and returns the moment you
 * scroll up. The current chapter is marked; on small screens the links fold
 * into a full-screen menu that traps nothing and closes on Escape.
 */
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [current, setCurrent] = useState("");
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      setSolid(y > 24);
      if (y < innerHeight * 0.6) {
        setHidden(false);
        last = y;
      } else if (Math.abs(y - last) > 6) {
        setHidden(y > last);
        last = y;
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["top", ...NAV.map((n) => n.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = matchMedia("(min-width: 900px)");
    const onMq = () => mq.matches && setOpen(false);
    addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <>
      <header className="nav" data-hidden={(hidden && !open) || undefined} data-solid={solid || undefined}>
        <a className="nav__mark" href="#top" aria-label="Krithiv Shankar, back to top">
          KS
        </a>
        <nav aria-label="Primary" className="nav__links">
          <ul>
            {NAV.filter((n) => n.id !== "contact").map((n, i) => (
              <li key={n.id}>
                <a href={`#${n.id}`} aria-current={current === n.id ? "true" : undefined}>
                  <Scramble text={n.label} playOnMount={700 + i * 90} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Btn href="#contact" size="sm" className="nav__cta">
          Contact
        </Btn>
        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </header>
      <div id="mobile-menu" ref={menuRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Menu">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
