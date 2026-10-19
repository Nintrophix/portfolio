import { initBench } from './bench.js';

document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function storeGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
function storeSet(k, v) { try { sessionStorage.setItem(k, v); } catch { /* storage blocked */ } }

/* ---------- split text into letters (keeps child spans for colour) ---------- */
function splitLetters(root) {
  let i = 0;
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const ch of child.textContent) {
          if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
          const span = document.createElement('span');
          span.className = 'letter'; span.textContent = ch; span.style.setProperty('--i', i++);
          frag.appendChild(span);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    }
  };
  walk(root);
}
$$('[data-letters]').forEach(splitLetters);

/* ---------- rolling button labels ---------- */
$$('.btn__roll').forEach((el) => {
  const txt = document.createElement('span');
  txt.className = 'btn__txt'; txt.textContent = el.textContent.trim();
  el.textContent = ''; el.appendChild(txt);
});
function setLabel(el, text) { el.dataset.label = text; el.querySelector('.btn__txt').textContent = text; }

/* ---------- scrambling nav labels ---------- */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scramble(el, duration = 600) {
  const final = el.dataset.text || (el.dataset.text = el.textContent);
  if (reduced) { el.textContent = final; return; }
  const t0 = performance.now();
  const tick = (now) => {
    const t = Math.min(1, Math.max(0, now - t0) / duration);
    const fixed = Math.floor(final.length * t);
    el.textContent = final.split('').map((c, k) => (k < fixed || c === ' ' ? c : GLYPHS[(Math.random() * 26) | 0])).join('');
    if (t < 1) requestAnimationFrame(tick); else el.textContent = final;
  };
  requestAnimationFrame(tick);
}
$$('[data-scramble]').forEach((a) => a.addEventListener('mouseenter', () => scramble(a, 400)));

/* ---------- headings and panels reveal on scroll ---------- */
function observeReveals() {
  const els = $$('.mask, .reveal');
  if (reduced) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  els.forEach((e) => io.observe(e));
}

/* ---------- load intro, then the page plays in ---------- */
const intro = $('#intro');
const heroLetters = $('#hero-name .letters');
function startPage() {
  document.body.classList.add('is-ready');
  heroLetters.classList.add('is-in');
  setTimeout(() => $$('[data-scramble]').forEach((a, k) => setTimeout(() => scramble(a), k * 80)), 300);
  setTimeout(observeReveals, 200);
}
if (reduced || storeGet('ks-intro')) {
  intro.classList.add('is-gone');
  startPage();
} else {
  document.body.classList.add('is-locked');
  requestAnimationFrame(() => $('.intro__name').classList.add('is-in'));
  const finish = () => {
    if (intro.classList.contains('is-out')) return;
    intro.classList.add('is-out');
    document.body.classList.remove('is-locked');
    storeSet('ks-intro', '1');
    setTimeout(startPage, 350);
    setTimeout(() => intro.classList.add('is-gone'), 950);
  };
  setTimeout(finish, 2300);
  intro.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });
}

/* ---------- orb parallax + scroll-linked name bands ---------- */
const orbs = $$('.orb').map((el) => ({ el, speed: parseFloat(el.dataset.speed) || 0 }));
const bands = $$('.band').map((el) => ({ el, dir: +el.dataset.dir }));
let ticking = false;
function onScrollFx() {
  ticking = false;
  const vh = innerHeight;
  for (const o of orbs) {
    const r = o.el.parentElement.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    o.el.style.transform = `translate3d(0, ${(-r.top * o.speed).toFixed(1)}px, 0)`;
  }
  for (const b of bands) {
    const r = b.el.getBoundingClientRect();
    const p = (vh - r.top) / (vh + r.height);
    b.el.style.transform = `translate3d(${(b.dir * (p * 30 - 20)).toFixed(2)}%, 0, 0)`;
  }
}
if (!reduced) {
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
  onScrollFx();
}

/* ---------- Irontronics bench ---------- */
initBench($('#experience'));

/* ---------- nav: current section, mobile menu ---------- */
const links = $$('.nav__links a');
const sectionIO = new IntersectionObserver((es) => {
  for (const e of es) if (e.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${e.target.id}`)));
}, { rootMargin: '-45% 0px -50% 0px' });
['top', 'experience', 'projects', 'skills', 'record', 'contact'].forEach((id) => sectionIO.observe(document.getElementById(id)));

const toggle = $('.nav__toggle');
const menu = $('#mobile-menu');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.hidden = !open;
  document.body.classList.toggle('is-locked', open);
  if (open) menu.querySelector('a').focus();
}
toggle.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
matchMedia('(min-width: 861px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

/* ---------- Friday: the pipeline lights stage by stage while in view ---------- */
(function friday() {
  const stages = $$('.pipe li');
  if (reduced) return;
  let k = 0, timer = 0;
  const step = () => { stages.forEach((s, i) => s.classList.toggle('is-on', i === k)); k = (k + 1) % stages.length; };
  new IntersectionObserver((es) => {
    clearInterval(timer);
    if (es[0].isIntersecting) { step(); timer = setInterval(step, 900); }
  }, { threshold: 0.4 }).observe($('.pipe'));
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
(function skills() {
  const used = $('#ledger-used');
  const idle = ' ';
  $$('#skills-ledger span[data-used]').forEach((s) => {
    s.tabIndex = 0;
    const show = () => { used.innerHTML = `<strong>${s.textContent}</strong> is used in ${s.dataset.used}.`; };
    s.addEventListener('mouseenter', show);
    s.addEventListener('focus', show);
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
  const roll = btn.querySelector('.btn__roll');
  setLabel(roll, 'Copied');
  showToast('Email copied to your clipboard');
  setTimeout(() => setLabel(roll, 'Copy'), 2200);
});

/* ---------- Theme switcher: light / dark from the green scale ---------- */
(function theme() {
  const root = document.documentElement;
  const btn = $('#theme-toggle');
  const meta = $('meta[name="theme-color"]');
  const apply = (t) => {
    root.dataset.theme = t;
    const dark = t === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    meta.setAttribute('content', dark ? '#0D1E10' : '#17301A');
  };
  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('ks-theme', next); } catch { /* storage blocked */ }
  });
  // follow the system until the visitor picks one
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (m) => {
    let saved = null;
    try { saved = localStorage.getItem('ks-theme'); } catch { /* storage blocked */ }
    if (!saved) apply(m.matches ? 'dark' : 'light');
  });
})();
