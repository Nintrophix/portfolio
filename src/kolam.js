// Sikku-kolam engine built on mirror curves.
// Dots sit at cell centres. The line runs diagonally through the midpoints of grid
// edges, crossing straight through an open edge and bouncing off a "mirror" edge.
// Cells covered by page text are removed, so the line also bounces around the copy.

const POWDERS = ['#f5efe4', '#f0aa1e', '#e8456f', '#5fb37a'];

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export class Kolam {
  constructor(canvas, { exclude = () => [], interactive = true, onChange = () => {}, pour = true } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.exclude = exclude;
    this.interactive = interactive;
    this.onChange = onChange;
    this.seed = 20260519;
    this.progress = pour ? 0 : 1;
    this.flash = null;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reduced) this.progress = 1;

    this.layout();
    this.randomise();
    this.draw();

    let t;
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { this.layout(true); this.draw(); }, 120); }).observe(canvas);
    if (interactive) canvas.addEventListener('click', (e) => this.onClick(e));
  }

  /* ---------- geometry ---------- */
  layout(keep = false) {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pulli')) || 44;
    this.s = s;
    this.W = Math.floor(r.width / s);
    this.H = Math.floor(r.height / s);
    this.ox = (r.width - this.W * s) / 2;
    this.oy = (r.height - this.H * s) / 2;

    // Mask: a cell is live unless page copy sits on it.
    const pad = s * 0.18;
    const rects = this.exclude().map((b) => ({
      l: b.left - r.left - pad, t: b.top - r.top - pad, r: b.right - r.left + pad, b: b.bottom - r.top + pad,
    }));
    this.live = new Uint8Array(this.W * this.H);
    for (let j = 0; j < this.H; j++) for (let i = 0; i < this.W; i++) {
      const x0 = this.ox + i * s, y0 = this.oy + j * s, x1 = x0 + s, y1 = y0 + s;
      const hit = rects.some((q) => x0 < q.r && x1 > q.l && y0 < q.b && y1 > q.t);
      this.live[j * this.W + i] = hit ? 0 : 1;
    }
    if (keep && this.mirrorSet) {
      if (this.W === this.prevW && this.H === this.prevH) this.applyMirrors(this.mirrorSet);
      else this.randomise(this.seed);
    }
    this.prevW = this.W; this.prevH = this.H;
  }

  cell(i, j) { return i >= 0 && j >= 0 && i < this.W && j < this.H && this.live[j * this.W + i] === 1; }

  // Edge points live on a (2W+1) x (2H+1) half-unit lattice.
  key(x, y) { return y * (2 * this.W + 1) + x; }

  sides(x, y) {
    // the two cells an edge point separates
    if (x % 2 === 0) { const i = x / 2, j = (y - 1) / 2; return [[i - 1, j], [i, j]]; }
    const i = (x - 1) / 2, j = y / 2; return [[i, j - 1], [i, j]];
  }

  isInternal(x, y) { const [a, b] = this.sides(x, y); return this.cell(...a) && this.cell(...b); }

  /* ---------- mirrors ---------- */
  randomise(seed = this.seed) {
    this.seed = seed;
    const rand = rng(seed);
    this.mirrors = new Set();
    for (let y = 0; y <= 2 * this.H; y++) for (let x = 0; x <= 2 * this.W; x++) {
      if ((x + y) % 2 === 0) continue;
      if (this.isInternal(x, y) && rand() < 0.42) this.mirrors.add(this.key(x, y));
    }
    this.trace();
    this.mergeToOne();
    this.mirrorSet = new Set(this.mirrors);
  }

  applyMirrors(set) {
    this.mirrors = new Set();
    for (const k of set) {
      const x = k % (2 * this.W + 1), y = Math.floor(k / (2 * this.W + 1));
      if (x <= 2 * this.W && this.isInternal(x, y)) this.mirrors.add(k);
    }
    this.trace();
    this.mergeToOne();
  }

  // Toggling a mirror where two different lines meet joins them: keep going until
  // the kolam is one unbroken line, as it is drawn by hand.
  mergeToOne() {
    for (let guard = 0; guard < 400 && this.loops.length > 1; guard++) {
      let found = -1;
      for (const [k, owners] of this.owners) {
        if (owners.size > 1) { const x = k % (2 * this.W + 1), y = Math.floor(k / (2 * this.W + 1)); if (this.isInternal(x, y)) { found = k; break; } }
      }
      if (found < 0) break;
      this.mirrors.has(found) ? this.mirrors.delete(found) : this.mirrors.add(found);
      this.trace();
    }
  }

  /* ---------- tracing ---------- */
  trace() {
    const seen = new Set();
    this.loops = [];
    this.owners = new Map();
    const segId = (x, y, dx, dy) => {
      // identify a segment by its cell and the corner it cuts
      let ci, cj, q;
      if (x % 2 === 0) { ci = dx > 0 ? x / 2 : x / 2 - 1; cj = (y - 1) / 2; q = (dx > 0 ? 0 : 2) + (dy < 0 ? 0 : 1); }
      else { cj = dy > 0 ? y / 2 : y / 2 - 1; ci = (x - 1) / 2; q = (dx > 0 ? 2 : 0) + (dy > 0 ? 0 : 1); }
      return (cj * this.W + ci) * 4 + q;
    };
    const turn = (x, y, dx, dy) => {
      const blocked = !this.isInternal(x, y) || this.mirrors.has(this.key(x, y));
      if (!blocked) return [dx, dy];
      return x % 2 === 0 ? [-dx, dy] : [dx, -dy];
    };

    for (let j = 0; j < this.H; j++) for (let i = 0; i < this.W; i++) {
      if (!this.cell(i, j)) continue;
      // start from this cell's left edge midpoint going up-right
      const sx = 2 * i, sy = 2 * j + 1;
      for (const [sdx, sdy] of [[1, -1], [1, 1]]) {
        if (seen.has(segId(sx, sy, sdx, sdy))) continue;
        const pts = [];
        let x = sx, y = sy, dx = sdx, dy = sdy;
        for (let n = 0; n < 200000; n++) {
          const id = segId(x, y, dx, dy);
          if (seen.has(id)) break;
          seen.add(id);
          pts.push([x, y]);
          x += dx; y += dy;
          [dx, dy] = turn(x, y, dx, dy);
        }
        if (pts.length > 2) {
          const idx = this.loops.length;
          this.loops.push(pts);
          for (const [px, py] of pts) {
            const k = this.key(px, py);
            if (!this.owners.has(k)) this.owners.set(k, new Set());
            this.owners.get(k).add(idx);
          }
        }
      }
    }
    this.loops.sort((a, b) => b.length - a.length);
    this.onChange(this.loops.length);
  }

  /* ---------- drawing ---------- */
  px(p) { return [this.ox + (p[0] * this.s) / 2, this.oy + (p[1] * this.s) / 2]; }

  pathFor(pts) {
    const p = new Path2D();
    const n = pts.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const P = pts.map((q) => this.px(q));
    let m = mid(P[n - 1], P[0]);
    p.moveTo(m[0], m[1]);
    for (let k = 0; k < n; k++) {
      const c = P[k], nm = mid(P[k], P[(k + 1) % n]);
      p.quadraticCurveTo(c[0], c[1], nm[0], nm[1]);
    }
    p.closePath();
    return p;
  }

  draw() {
    const { ctx, s } = this;
    ctx.clearRect(0, 0, this.w, this.h);

    // pulli dots
    ctx.fillStyle = 'rgba(245, 239, 228, 0.82)';
    const dotP = Math.min(1, this.progress * 3);
    for (let j = 0; j < this.H; j++) for (let i = 0; i < this.W; i++) {
      if (!this.cell(i, j)) continue;
      ctx.beginPath();
      ctx.arc(this.ox + (i + 0.5) * s, this.oy + (j + 0.5) * s, Math.max(1.6, s * 0.055) * dotP, 0, Math.PI * 2);
      ctx.fill();
    }

    const lw = Math.max(2, s * 0.06);
    const seg = (s / Math.SQRT2) * 0.93;
    this.loops.forEach((pts, li) => {
      const path = this.pathFor(pts);
      const len = pts.length * seg * 1.05;
      ctx.save();
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = POWDERS[li % POWDERS.length];
      if (this.progress < 1) {
        ctx.setLineDash([len, len]);
        ctx.lineDashOffset = len * (1 - this.progress);
      }
      // a soft shadow lifts the flour off the floor
      ctx.shadowColor = 'rgba(40, 8, 4, 0.35)';
      ctx.shadowOffsetY = 1.5;
      ctx.shadowBlur = 3;
      ctx.stroke(path);
      ctx.restore();
    });

    if (this.flash) {
      const [x, y] = this.px(this.flash.p);
      const a = this.flash.a;
      ctx.strokeStyle = `rgba(240, 170, 30, ${a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, s * (0.25 + (1 - a) * 0.35), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  pourIn(duration = 2600) {
    if (this.reduced) { this.progress = 1; this.draw(); return; }
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, Math.max(0, now - t0) / duration);
      this.progress = ease(t);
      this.draw();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // never leave the floor blank if frames are throttled (background tabs, capture tools)
    clearTimeout(this.safety);
    this.safety = setTimeout(() => { if (this.progress < 1) { this.progress = 1; this.draw(); } }, duration + 1200);
  }

  shuffle() {
    this.layout();
    this.randomise((Math.random() * 1e9) | 0);
    this.progress = 0;
    this.pourIn(1800);
  }

  onClick(e) {
    const r = this.canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    // nearest edge midpoint on the half-unit lattice
    const gx = Math.round(((mx - this.ox) / this.s) * 2);
    const gy = Math.round(((my - this.oy) / this.s) * 2);
    let best = null, bd = Infinity;
    for (let y = gy - 1; y <= gy + 1; y++) for (let x = gx - 1; x <= gx + 1; x++) {
      if ((x + y) % 2 === 0 || x < 0 || y < 0 || x > 2 * this.W || y > 2 * this.H) continue;
      if (!this.isInternal(x, y)) continue;
      const [px, py] = this.px([x, y]);
      const d = Math.hypot(px - mx, py - my);
      if (d < bd) { bd = d; best = [x, y]; }
    }
    if (!best || bd > this.s * 0.45) return;
    const k = this.key(...best);
    this.mirrors.has(k) ? this.mirrors.delete(k) : this.mirrors.add(k);
    this.mirrorSet = new Set(this.mirrors);
    this.trace();
    this.progress = 1;
    this.flash = { p: best, a: 1 };
    const fade = () => {
      if (!this.flash) return;
      this.flash.a -= 0.05;
      if (this.flash.a <= 0) this.flash = null;
      this.draw();
      if (this.flash) requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  }
}

// Line boxes of an element's text, so the kolam can hug ragged lines of copy.
export function textRects(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
}
