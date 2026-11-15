import { useEffect, useRef, useState } from "react";

/**
 * ScrollRail: the page's own scrollbar, fixed at the middle of the right
 * edge. The thumb maps document scroll exactly (no easing on position),
 * can be dragged, the track can be clicked, and it is keyboard operable.
 * Section ticks mark the chapters; their labels show while the rail is
 * hovered or focused. On touch devices and narrow screens it steps aside
 * and the native scrollbar does the job.
 */

type Tick = { id: string; label: string; at: number };

export function ScrollRail({ sections }: { sections: readonly { id: string; label: string }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [moving, setMoving] = useState(false);
  const [value, setValue] = useState(0);
  const [current, setCurrent] = useState("");
  const drag = useRef<{ offset: number } | null>(null);

  // only on fine pointers and wide enough screens
  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const update = () => setActive(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.classList.add("has-rail");
    const track = trackRef.current!;
    const thumb = thumbRef.current!;
    let raf = 0;
    let idle = 0;

    const metrics = () => {
      const doc = root.scrollHeight;
      const vh = innerHeight;
      const th = track.clientHeight;
      const thumbH = Math.max(28, Math.round((vh / doc) * th));
      return { max: Math.max(1, doc - vh), th, thumbH };
    };

    const paint = () => {
      raf = 0;
      const { max, th, thumbH } = metrics();
      const p = Math.min(1, Math.max(0, scrollY / max));
      thumb.style.height = `${thumbH}px`;
      thumb.style.transform = `translate3d(0, ${(p * (th - thumbH)).toFixed(2)}px, 0)`;
      setValue(Math.round(p * 100));
      // which chapter are we in
      const mid = scrollY + innerHeight * 0.45;
      let cur = "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= mid) cur = s.id;
      }
      setCurrent(cur);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onScroll = () => {
      schedule();
      setMoving(true);
      clearTimeout(idle);
      idle = window.setTimeout(() => setMoving(false), 900);
    };

    const measureTicks = () => {
      const max = Math.max(1, root.scrollHeight - innerHeight);
      setTicks(
        sections
          .map((s) => {
            const el = document.getElementById(s.id);
            return el ? { id: s.id, label: s.label, at: Math.min(1, el.offsetTop / max) } : null;
          })
          .filter(Boolean) as Tick[],
      );
      schedule();
    };

    const ro = new ResizeObserver(measureTicks);
    ro.observe(document.body);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", measureTicks);
    measureTicks();
    return () => {
      root.classList.remove("has-rail");
      ro.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", measureTicks);
    };
  }, [active, sections]);

  const scrollToRatio = (ratio: number) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo({ top: Math.min(1, Math.max(0, ratio)) * max, behavior: "instant" as ScrollBehavior });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const track = trackRef.current!;
    const thumb = thumbRef.current!;
    const tr = track.getBoundingClientRect();
    const thr = thumb.getBoundingClientRect();
    const onThumb = e.clientY >= thr.top && e.clientY <= thr.bottom;
    // grabbing the thumb keeps the grab point; clicking the track centres the thumb there
    drag.current = { offset: onThumb ? e.clientY - thr.top : thr.height / 2 };
    track.setPointerCapture(e.pointerId);
    setDragging(true);
    const ratio = (e.clientY - tr.top - drag.current.offset) / (tr.height - thr.height);
    if (!onThumb) scrollToRatio(ratio);
    e.preventDefault();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const tr = trackRef.current!.getBoundingClientRect();
    const thH = thumbRef.current!.offsetHeight;
    scrollToRatio((e.clientY - tr.top - drag.current.offset) / (tr.height - thH));
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    trackRef.current?.releasePointerCapture(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = innerHeight * 0.15;
    const page = innerHeight * 0.9;
    const map: Record<string, number> = { ArrowDown: step, ArrowUp: -step, PageDown: page, PageUp: -page };
    if (e.key in map) {
      window.scrollBy({ top: map[e.key], behavior: "smooth" });
    } else if (e.key === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (e.key === "End") {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    } else return;
    e.preventDefault();
  };

  if (!active) return null;

  return (
    <div
      className="rail group fixed right-3 top-1/2 z-[90] -translate-y-1/2 lg:right-5"
      data-dragging={dragging || undefined}
      data-moving={moving || undefined}
    >
      <div
        ref={trackRef}
        role="scrollbar"
        aria-label="Page scroll position"
        aria-controls="main"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${value}% down the page`}
        tabIndex={0}
        data-cursor=""
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="rail__track relative h-[min(44vh,380px)] w-6 cursor-grab touch-none active:cursor-grabbing"
      >
        <span aria-hidden="true" className="rail__line" />
        {ticks.map((t) => (
          <span
            key={t.id}
            aria-hidden="true"
            className="rail__tick"
            data-on={current === t.id || undefined}
            style={{ top: `${t.at * 100}%` }}
          >
            <span className="rail__label">{t.label}</span>
          </span>
        ))}
        <div ref={thumbRef} aria-hidden="true" className="rail__thumb" />
      </div>
    </div>
  );
}

export default ScrollRail;
