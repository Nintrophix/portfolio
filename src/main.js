import { Kolam, textRects } from './kolam.js';
import { initBench } from './bench.js';

document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Hero kolam ---------- */
const heroBlock = $('#hero-block');
const countEl = $('#kolam-count');
const wordEl = $('#kolam-word');
const hintEl = $('#kolam-hint');
let touched = false;

function startHero() {
  const hero = new Kolam($('#kolam'), {
    exclude: () => [
      ...textRects($('#hero-name')),
      ...textRects($('.threshold__lede')),
      ...$$('.threshold__actions .btn').map((b) => b.getBoundingClientRect()),
      ...$$('.threshold__foot > *').map((b) => b.getBoundingClientRect()),
      $('#nav').getBoundingClientRect(),
    ],
    onChange: (n) => {
      countEl.textContent = n;
      wordEl.textContent = n === 1 ? 'line' : 'lines';
      if (touched) hintEl.textContent = n === 1 ? 'One unbroken line again, the way it is drawn by hand.' : 'The line split. Tap where two colours meet to join them.';
    },
  });
  $('#kolam').addEventListener('click', () => { touched = true; }, { capture: true });
  $('#kolam-shuffle').addEventListener('click', () => { touched = false; hintEl.textContent = 'Tap between the dots to bend the line.'; hero.shuffle(); });
  hero.pourIn();
}

/* ---------- Closing kolam (decorative) ---------- */
function startClose() {
  const canvas = $('#kolam-close');
  const k = new Kolam(canvas, {
    interactive: false,
    exclude: () => [
      ...textRects($('#contact-title')),
      ...$$('.close__inner > p, .close__mail > *, .links a, .foot > *').map((e) => e.getBoundingClientRect()),
    ],
  });
  k.randomise(777);
  k.progress = reduced ? 1 : 0;
  k.draw();
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { io.disconnect(); k.layout(); k.randomise(777); k.pourIn(3200); }
  }, { threshold: 0.25 });
  io.observe(canvas);
}

/* ---------- Seam bands: a one-line kolam opens each section ---------- */
function startBands() {
  $$('.kolam-band').forEach((canvas, i) => {
    const k = new Kolam(canvas, { interactive: false });
    k.randomise(101 + i * 37);
    k.draw();
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); k.progress = 0; k.pourIn(2200); }
    }, { threshold: 0.5 });
    io.observe(canvas);
  });
}

(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  startHero();
  startBands();
  startClose();
});

/* ---------- Irontronics bench ---------- */
initBench($('#irontronics'));

/* ---------- Nav: scrolled state, section highlighting, mobile menu ---------- */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const darkSections = ['irontronics', 'record'];
const links = $$('.nav__links a');
const sectionIO = new IntersectionObserver((es) => {
  for (const e of es) {
    if (!e.isIntersecting) continue;
    const id = e.target.id;
    nav.classList.toggle('is-dark', darkSections.includes(id));
    links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${id}`)));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
['top', 'irontronics', 'projects', 'skills', 'record', 'contact'].forEach((id) => sectionIO.observe(document.getElementById(id)));

const toggle = $('.nav__toggle');
const menu = $('#mobile-menu');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) menu.querySelector('a').focus();
}
toggle.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
matchMedia('(min-width: 821px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

/* ---------- Friday pipeline ---------- */
(function friday() {
  const path = $('#friday-path');
  const pulse = $('.flow__pulse');
  const nodes = $$('.flow__nodes circle');
  const len = path.getTotalLength();
  // where along the line each stage's loop begins
  const nodeAt = nodes.map((n) => {
    const cx = +n.getAttribute('cx');
    for (let l = 0; l <= len; l += 4) if (Math.abs(path.getPointAtLength(l).x - cx) < 2 && path.getPointAtLength(l).y > 130) return l;
    return 0;
  });
  if (reduced) { nodes.forEach((n) => n.classList.add('is-on')); pulse.style.display = 'none'; return; }
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  let raf = 0, visible = false, t0 = 0, drawn = false;
  const loop = (now) => {
    if (!visible) return;
    if (!t0) t0 = now;
    const el = now - t0;
    if (!drawn) {
      const t = Math.min(1, el / 1600), e = 1 - Math.pow(1 - t, 3);
      path.style.strokeDashoffset = len * (1 - e);
      if (t >= 1) { drawn = true; t0 = now; }
    }
    const t = drawn ? ((now - t0) % 4200) / 4200 : 0;
    const p = path.getPointAtLength(len * t);
    pulse.setAttribute('cx', p.x); pulse.setAttribute('cy', p.y);
    pulse.style.opacity = drawn ? 1 : 0;
    nodes.forEach((n, i) => n.classList.toggle('is-on', drawn && len * t >= nodeAt[i]));
    raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    cancelAnimationFrame(raf);
    // a pour interrupted by scrolling away finishes rather than restarting
    if (!visible && t0 && !drawn) { drawn = true; path.style.strokeDashoffset = 0; }
    if (visible) { t0 = 0; raf = requestAnimationFrame(loop); }
  }, { threshold: 0.35 }).observe($('.flow'));
})();

/* ---------- Debug Odyssey: campaign of 50 dots ---------- */
(function campaign() {
  const svg = $('#campaign-svg');
  const ns = 'http://www.w3.org/2000/svg';
  const cols = 10, rows = 5, gx = 38, gy = 34, ox = 29, oy = 16;
  const pts = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cc = r % 2 ? cols - 1 - c : c;
    pts.push([ox + cc * gx, oy + r * gy]);
  }
  // the route snakes level to level, turning in a loop at each row end
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i], [px, py] = pts[i - 1];
    if (y !== py) { const side = px > 200 ? 1 : -1; d += ` C${px + side * 24} ${py}, ${x + side * 24} ${y}, ${x} ${y}`; }
    else d += ` L${x} ${y}`;
  }
  const line = document.createElementNS(ns, 'path');
  line.setAttribute('d', d); line.setAttribute('class', 'c-line');
  svg.appendChild(line);
  const dots = pts.map(([x, y]) => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 5); c.setAttribute('class', 'c-dot');
    svg.appendChild(c); return c;
  });
  const len = line.getTotalLength();
  const n = $('#campaign-n');
  if (reduced) { dots.forEach((c) => c.classList.add('is-on')); return; }
  line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
  n.textContent = '0';
  const io = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, now - t0) / 2600), e = 1 - Math.pow(1 - t, 3);
      line.style.strokeDashoffset = len * (1 - e);
      const k = Math.round(e * 50);
      dots.forEach((c, i) => c.classList.toggle('is-on', i < k));
      n.textContent = k;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.6 });
  io.observe(svg);
})();

/* ---------- Debug Odyssey: read / decode / fix ---------- */
(function decoder() {
  const steps = [
    {
      code: `Traceback (most recent call last):
  File "quest.py", line 4, in &lt;module&gt;
    print(totl)
<span class="hl"><span class="k">NameError</span>: name 'totl' is not defined</span>`,
      say: 'Start at the bottom. The last line names the error type and what went wrong: Python cannot find anything called <code>totl</code>.',
    },
    {
      code: `<span class="g">1</span>  prices = [<span class="y">120</span>, <span class="y">80</span>, <span class="y">45</span>]
<span class="g">2</span>  total = sum(prices)
<span class="g">3</span>
<span class="hl"><span class="g">4</span>  print(totl)</span>`,
      say: 'The traceback points at line 4. A NameError means that name was never created. Compare it with the one that was: <code>total</code>, on line 2.',
    },
    {
      code: `<span class="g">1</span>  prices = [<span class="y">120</span>, <span class="y">80</span>, <span class="y">45</span>]
<span class="g">2</span>  total = sum(prices)
<span class="g">3</span>
<span class="ok"><span class="g">4</span>  print(total)</span>

<span class="g">&gt;&gt;&gt;</span> 245`,
      say: 'Fix the typo and run it again. The error is gone and the program prints 245. Read, decode, fix: the same loop works in every language.',
    },
  ];
  const tabs = $$('#decoder [role="tab"]');
  const panel = $('#dp');
  const code = $('#decoder-code');
  const say = $('#decoder-say');
  function show(i, focus = false) {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tabs[i].id);
    code.innerHTML = steps[i].code;
    say.innerHTML = steps[i].say;
    if (focus) tabs[i].focus();
    if (!reduced) code.animate([{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 380, easing: 'cubic-bezier(0.16,1,0.3,1)' });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show((i + 1) % tabs.length, true);
      if (e.key === 'ArrowLeft') show((i + tabs.length - 1) % tabs.length, true);
    });
  });
  show(0);
})();

/* ---------- Skills: where each tool is used ---------- */
(function ledger() {
  const used = $('#ledger-used');
  const idle = ' ';
  used.textContent = idle;
  $$('#skills-ledger span[data-used]').forEach((s) => {
    s.tabIndex = 0;
    const showIt = () => { used.innerHTML = `<strong>${s.textContent}</strong> is used in ${s.dataset.used}.`; };
    s.addEventListener('mouseenter', showIt);
    s.addEventListener('focus', showIt);
    s.addEventListener('mouseleave', () => { used.textContent = idle; });
    s.addEventListener('blur', () => { used.textContent = idle; });
  });
})();

/* ---------- Contact: copy email ---------- */
const toast = $('#toast');
let toastT;
function showToast(msg) {
  toast.textContent = msg; toast.classList.add('is-on');
  clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2200);
}
$('#copy-email').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const text = btn.dataset.copy;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  btn.querySelector('span').textContent = 'Copied';
  showToast('Email copied to your clipboard');
  setTimeout(() => { btn.querySelector('span').textContent = 'Copy'; }, 2200);
});

/* ---------- Reveals: one entrance grammar, content visible without JS ---------- */
const revealTargets = $$('.bench__intro, .rig, .facts, .projects .h2, .project__head, .project__body, .tags--row, .ledger-sec .h2, .ledger, .record__group, .close__inner > *');
revealTargets.forEach((el) => el.classList.add('reveal'));
const rio = new IntersectionObserver((es) => {
  for (const e of es) if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
revealTargets.forEach((el) => rio.observe(el));
