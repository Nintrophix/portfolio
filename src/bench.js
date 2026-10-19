// A small, real re-creation of the scan-to-G-code idea on a synthetic part:
// grayscale -> blur -> Otsu threshold -> Moore boundary trace -> hole labelling -> G-code.

const PW = 320, PH = 200;      // processing resolution
const MM_PER_PX = 0.5;         // demo calibration
// one hue only: the design system's green scale
const C = { flour: '#E7EFE3', turmeric: '#8FB582', kumkum: '#D3E2CC', leaf: '#6A9A5C', stone: '#0D1E10', dim: 'rgba(231,239,227,.18)' };

function rng(seed) {
  let s = seed >>> 0 || 7;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e6) / 1e6; };
}

/* ---------- synthetic camera frame ---------- */
function makeFrame(seed) {
  const r = rng(seed);
  const cv = document.createElement('canvas');
  cv.width = PW; cv.height = PH;
  const g = cv.getContext('2d');

  g.fillStyle = '#284727'; g.fillRect(0, 0, PW, PH);

  // part outline: one of three bracket shapes
  const kind = Math.floor(r() * 3);
  const x0 = 46 + r() * 16, y0 = 30 + r() * 12, w = 200 + r() * 30, h = 120 + r() * 14;
  const path = new Path2D();
  const rad = 10;
  if (kind === 0) { // L-bracket
    const cw = w * (0.42 + r() * 0.1), ch = h * (0.45 + r() * 0.1);
    path.moveTo(x0 + rad, y0); path.lineTo(x0 + cw, y0); path.lineTo(x0 + cw, y0 + h - ch);
    path.lineTo(x0 + w - rad, y0 + h - ch); path.arcTo(x0 + w, y0 + h - ch, x0 + w, y0 + h, rad);
    path.lineTo(x0 + w, y0 + h - rad); path.arcTo(x0 + w, y0 + h, x0, y0 + h, rad);
    path.lineTo(x0 + rad, y0 + h); path.arcTo(x0, y0 + h, x0, y0, rad);
    path.lineTo(x0, y0 + rad); path.arcTo(x0, y0, x0 + w, y0, rad);
  } else if (kind === 1) { // link plate with round ends
    const rr = h / 2;
    path.moveTo(x0 + rr, y0); path.lineTo(x0 + w - rr, y0);
    path.arc(x0 + w - rr, y0 + rr, rr, -Math.PI / 2, Math.PI / 2);
    path.lineTo(x0 + rr, y0 + h);
    path.arc(x0 + rr, y0 + rr, rr, Math.PI / 2, (3 * Math.PI) / 2);
  } else { // plate with chamfer and notch
    const ch = 26, nw = 40, nd = 22, nx = x0 + w * 0.45;
    path.moveTo(x0 + ch, y0); path.lineTo(nx, y0); path.lineTo(nx, y0 + nd); path.lineTo(nx + nw, y0 + nd); path.lineTo(nx + nw, y0);
    path.lineTo(x0 + w, y0); path.lineTo(x0 + w, y0 + h - ch); path.lineTo(x0 + w - ch, y0 + h);
    path.lineTo(x0, y0 + h); path.lineTo(x0, y0 + ch);
  }
  path.closePath();

  const metal = '#B6CFAB';
  g.save();
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 8; g.shadowOffsetY = 3;
  g.fillStyle = metal; g.fill(path);
  g.restore();

  // bolt holes, placed where the plate is solid
  const holes = [];
  const want = 3 + Math.floor(r() * 3);
  for (let tries = 0; holes.length < want && tries < 400; tries++) {
    const hr = 5 + r() * 7;
    const hx = x0 + hr + 6 + r() * (w - 2 * hr - 12), hy = y0 + hr + 6 + r() * (h - 2 * hr - 12);
    let ok = true;
    for (let a = 0; a < 16 && ok; a++) {
      const px = hx + Math.cos((a / 16) * Math.PI * 2) * (hr + 6), py = hy + Math.sin((a / 16) * Math.PI * 2) * (hr + 6);
      if (!g.isPointInPath(path, px, py)) ok = false;
    }
    if (ok && holes.every((o) => Math.hypot(o.x - hx, o.y - hy) > o.r + hr + 10)) holes.push({ x: hx, y: hy, r: hr });
  }
  for (const o of holes) {
    g.fillStyle = '#284727'; g.beginPath(); g.arc(o.x, o.y, o.r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.beginPath(); g.arc(o.x, o.y, o.r + 0.5, Math.PI * 0.9, Math.PI * 1.7); g.stroke();
  }

  // sensor noise
  const img = g.getImageData(0, 0, PW, PH);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 34;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return cv;
}

/* ---------- pipeline ---------- */
function process(frame) {
  const d = frame.getContext('2d').getImageData(0, 0, PW, PH).data;
  const gray = new Float32Array(PW * PH);
  for (let i = 0; i < PW * PH; i++) gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];

  // 3x3 box blur
  const blur = new Uint8Array(PW * PH);
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    let s = 0, n = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const xx = x + i, yy = y + j;
      if (xx >= 0 && yy >= 0 && xx < PW && yy < PH) { s += gray[yy * PW + xx]; n++; }
    }
    blur[y * PW + x] = Math.round(s / n);
  }

  // Otsu: pick the threshold that maximises between-class variance
  const hist = new Array(256).fill(0);
  for (const v of blur) hist[v]++;
  const total = PW * PH;
  let sum = 0; for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0, wB = 0, best = 0, T = 0;
  for (let t = 0; t < 256; t++) {
    wB += hist[t]; if (!wB) continue;
    const wF = total - wB; if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB, mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) { best = between; T = t; }
  }
  const bin = new Uint8Array(PW * PH);
  let on = 0;
  for (let i = 0; i < total; i++) if (blur[i] > T) { bin[i] = 1; on++; }

  // Moore-neighbour boundary trace of the outer contour
  const at = (x, y) => (x >= 0 && y >= 0 && x < PW && y < PH ? bin[y * PW + x] : 0);
  let start = -1;
  for (let i = 0; i < total && start < 0; i++) if (bin[i]) start = i;
  const N = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const contour = [];
  if (start >= 0) {
    let cx = start % PW, cy = (start / PW) | 0, dir = 7;
    const sx = cx, sy = cy;
    for (let guard = 0; guard < 20000; guard++) {
      contour.push([cx, cy]);
      let found = false;
      for (let k = 0; k < 8; k++) {
        const nd = (dir + 6 + k) % 8;
        const nx = cx + N[nd][0], ny = cy + N[nd][1];
        if (at(nx, ny)) { cx = nx; cy = ny; dir = nd; found = true; break; }
      }
      if (!found || (cx === sx && cy === sy && contour.length > 2)) break;
    }
  }

  // holes: background regions not connected to the frame border
  const lab = new Int32Array(total);
  const flood = (seed, id) => {
    const q = [seed]; lab[seed] = id; const px = [];
    while (q.length) {
      const p = q.pop(); px.push(p);
      const x = p % PW, y = (p / PW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= PW || yy >= PH) continue;
        const k = yy * PW + xx;
        if (!bin[k] && !lab[k]) { lab[k] = id; q.push(k); }
      }
    }
    return px;
  };
  for (let x = 0; x < PW; x++) for (const y of [0, PH - 1]) { const k = y * PW + x; if (!bin[k] && !lab[k]) flood(k, 1); }
  for (let y = 0; y < PH; y++) for (const x of [0, PW - 1]) { const k = y * PW + x; if (!bin[k] && !lab[k]) flood(k, 1); }
  const holes = [];
  let id = 2;
  for (let k = 0; k < total; k++) {
    if (bin[k] || lab[k]) continue;
    const px = flood(k, id++);
    if (px.length < 25) continue;
    let sx = 0, sy = 0; for (const p of px) { sx += p % PW; sy += (p / PW) | 0; }
    holes.push({ x: sx / px.length, y: sy / px.length, area: px.length, d: 2 * Math.sqrt(px.length / Math.PI) });
  }
  holes.sort((a, b) => a.x - b.x);

  const simple = simplify(contour, 1.3);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of contour) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }

  return { hist, T, bin, on: on / total, contour, simple, holes, box: { minX, minY, maxX, maxY } };
}

// Ramer-Douglas-Peucker on a closed contour
function simplify(pts, eps) {
  if (pts.length < 4) return pts.slice();
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > fd) { fd = d; far = i; }
  }
  const rdp = (a) => {
    if (a.length < 3) return a;
    const [x1, y1] = a[0], [x2, y2] = a[a.length - 1];
    const L = Math.hypot(x2 - x1, y2 - y1) || 1;
    let idx = 0, md = 0;
    for (let i = 1; i < a.length - 1; i++) {
      const d = Math.abs((y2 - y1) * a[i][0] - (x2 - x1) * a[i][1] + x2 * y1 - y2 * x1) / L;
      if (d > md) { md = d; idx = i; }
    }
    if (md <= eps) return [a[0], a[a.length - 1]];
    const l = rdp(a.slice(0, idx + 1)), r = rdp(a.slice(idx));
    return l.slice(0, -1).concat(r);
  };
  const A = rdp(pts.slice(0, far + 1));
  const B = rdp(pts.slice(far).concat([pts[0]]));
  return A.slice(0, -1).concat(B.slice(0, -1));
}

function gcode(res) {
  const { simple, holes, box } = res;
  const X = (x) => ((x - box.minX) * MM_PER_PX).toFixed(2);
  const Y = (y) => ((box.maxY - y) * MM_PER_PX).toFixed(2);
  const L = [];
  L.push('; demo output, synthetic part');
  L.push(`; part ${((box.maxX - box.minX) * MM_PER_PX).toFixed(1)} x ${((box.maxY - box.minY) * MM_PER_PX).toFixed(1)} mm`);
  L.push('G21 ; millimetres');
  L.push('G90 ; absolute positioning');
  L.push('G0 Z5.00');
  L.push('; profile');
  L.push(`G0 X${X(simple[0][0])} Y${Y(simple[0][1])}`);
  L.push('G1 Z-1.00 F200');
  for (let i = 1; i < simple.length; i++) L.push(`G1 X${X(simple[i][0])} Y${Y(simple[i][1])} F600`);
  L.push(`G1 X${X(simple[0][0])} Y${Y(simple[0][1])}`);
  L.push('G0 Z5.00');
  holes.forEach((h, i) => {
    L.push(`; hole ${i + 1}, dia ${(h.d * MM_PER_PX).toFixed(1)} mm`);
    L.push(`G0 X${X(h.x)} Y${Y(h.y)}`);
    L.push('G1 Z-1.00 F150');
    L.push('G0 Z5.00');
  });
  L.push('M2 ; end');
  return L;
}

function hl(line) {
  const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const [code, ...c] = esc.split(';');
  const comment = c.length ? `<span class="g-c">;${c.join(';')}</span>` : '';
  const body = code.replace(/\b([GM]\d+)\b/g, '<span class="g-g">$1</span>').replace(/([XYZF])(-?[\d.]+)/g, '$1<span class="g-n">$2</span>');
  return body + comment;
}

/* ---------- the bench UI ---------- */
export function initBench(root) {
  const canvas = root.querySelector('#rig-canvas');
  const ctx = canvas.getContext('2d');
  const readout = root.querySelector('#rig-readout');
  const steps = [...root.querySelectorAll('#rig-steps button')];
  const runBtn = root.querySelector('#rig-run');
  const newBtn = root.querySelector('#rig-new');
  const out = root.querySelector('#rig-gcode code');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LW = 640, LH = 400;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = LW * dpr; canvas.height = LH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const S = LW / PW;

  let seed = 4, frame, res, lines, stage = 0, running = false, anim = 0;

  const binCanvas = document.createElement('canvas');
  binCanvas.width = PW; binCanvas.height = PH;

  function load() {
    frame = makeFrame(seed);
    res = process(frame);
    lines = gcode(res);
    const g = binCanvas.getContext('2d');
    const im = g.createImageData(PW, PH);
    for (let i = 0; i < PW * PH; i++) {
      const v = res.bin[i];
      im.data[i * 4] = v ? 231 : 13; im.data[i * 4 + 1] = v ? 239 : 30; im.data[i * 4 + 2] = v ? 227 : 16; im.data[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  }

  function viewfinder() {
    ctx.strokeStyle = 'rgba(231,239,227,.55)'; ctx.lineWidth = 2;
    const m = 18, l = 26, W = LW, H = LH;
    for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(x, y + sy * l); ctx.lineTo(x, y); ctx.lineTo(x + sx * l, y); ctx.stroke();
    }
  }

  function histogram() {
    const w = 150, h = 56, x = LW - w - 16, y = 16;
    ctx.fillStyle = 'rgba(13,30,16,.85)'; ctx.fillRect(x - 8, y - 8, w + 16, h + 30);
    const max = Math.max(...res.hist);
    ctx.fillStyle = 'rgba(231,239,227,.7)';
    for (let t = 0; t < 256; t++) {
      const bh = Math.sqrt(res.hist[t] / max) * h;
      ctx.fillRect(x + (t / 256) * w, y + h - bh, w / 256 + 0.3, bh);
    }
    const tx = x + (res.T / 256) * w;
    ctx.strokeStyle = C.turmeric; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, y - 2); ctx.lineTo(tx, y + h + 2); ctx.stroke();
    ctx.fillStyle = C.turmeric; ctx.font = '600 12px ui-monospace, Consolas, monospace';
    ctx.fillText(`T = ${res.T}`, Math.min(tx + 4, x + w - 46), y + h + 16);
  }

  function contourPath(frac = 1) {
    const pts = res.contour, n = Math.max(2, Math.floor(pts.length * frac));
    ctx.beginPath();
    ctx.moveTo((pts[0][0] + 0.5) * S, (pts[0][1] + 0.5) * S);
    for (let i = 1; i < n; i++) ctx.lineTo((pts[i][0] + 0.5) * S, (pts[i][1] + 0.5) * S);
    if (frac >= 1) ctx.closePath();
  }

  function render(st, t = 1) {
    const W = LW, H = LH;
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    if (st === 0) { ctx.drawImage(frame, 0, 0, W, H); viewfinder(); return; }
    if (st === 1) {
      // wipe from frame to binary
      ctx.drawImage(frame, 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * t, H); ctx.clip();
      ctx.imageSmoothingEnabled = false; ctx.drawImage(binCanvas, 0, 0, W, H); ctx.restore();
      if (t < 1) { ctx.fillStyle = C.turmeric; ctx.fillRect(W * t - 1, 0, 2, H); }
      histogram(); return;
    }
    ctx.globalAlpha = 0.22; ctx.imageSmoothingEnabled = false; ctx.drawImage(binCanvas, 0, 0, W, H); ctx.globalAlpha = 1;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (st === 2) {
      contourPath(t); ctx.strokeStyle = C.flour; ctx.lineWidth = 3; ctx.stroke();
      if (t < 1) {
        const p = res.contour[Math.floor((res.contour.length - 1) * t)];
        ctx.fillStyle = C.turmeric; ctx.beginPath(); ctx.arc((p[0] + .5) * S, (p[1] + .5) * S, 6, 0, Math.PI * 2); ctx.fill();
      }
      return;
    }
    contourPath(1); ctx.strokeStyle = st === 4 ? 'rgba(231,239,227,.35)' : C.flour; ctx.lineWidth = 3; ctx.stroke();

    if (st === 3) {
      res.holes.forEach((h, i) => {
        const a = Math.max(0, Math.min(1, t * res.holes.length - i));
        if (!a) return;
        const x = h.x * S, y = h.y * S, rr = (h.d / 2) * S;
        ctx.globalAlpha = a;
        ctx.strokeStyle = C.turmeric; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, rr + 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - rr - 9, y); ctx.lineTo(x + rr + 9, y); ctx.moveTo(x, y - rr - 9); ctx.lineTo(x, y + rr + 9); ctx.stroke();
        const label = `Ø ${(h.d * MM_PER_PX).toFixed(1)} mm`;
        ctx.font = '600 13px ui-monospace, Consolas, monospace';
        const tw = ctx.measureText(label).width;
        const lx = Math.min(x + rr + 8, W - tw - 14), ly = y - rr - 10;
        ctx.fillStyle = 'rgba(13,30,16,.85)'; ctx.fillRect(lx - 5, ly - 14, tw + 10, 20);
        ctx.fillStyle = C.turmeric; ctx.fillText(label, lx, ly);
        ctx.globalAlpha = 1;
      });
      return;
    }
    // st 4: toolpath
    const sp = res.simple;
    const n = Math.max(2, Math.floor(sp.length * Math.min(1, t * 1.4)));
    ctx.beginPath(); ctx.moveTo(sp[0][0] * S, sp[0][1] * S);
    for (let i = 1; i < n; i++) ctx.lineTo(sp[i][0] * S, sp[i][1] * S);
    if (n === sp.length) ctx.closePath();
    ctx.strokeStyle = C.turmeric; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = C.flour;
    for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(sp[i][0] * S, sp[i][1] * S, 3.2, 0, Math.PI * 2); ctx.fill(); }
    if (t > 0.7) {
      ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(231,239,227,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); let px = sp[0][0] * S, py = sp[0][1] * S; ctx.moveTo(px, py);
      for (const h of res.holes) ctx.lineTo(h.x * S, h.y * S);
      ctx.stroke(); ctx.setLineDash([]);
      for (const h of res.holes) { ctx.fillStyle = C.kumkum; ctx.beginPath(); ctx.arc(h.x * S, h.y * S, 5, 0, Math.PI * 2); ctx.fill(); }
    }
  }

  function say(st) {
    const b = res.box;
    const wmm = ((b.maxX - b.minX) * MM_PER_PX).toFixed(1), hmm = ((b.maxY - b.minY) * MM_PER_PX).toFixed(1);
    const msg = [
      `Frame ${PW}×${PH} px · synthetic bracket`,
      `Otsu threshold T = ${res.T} · ${(res.on * 100).toFixed(0)}% of pixels are metal`,
      `Boundary: ${res.contour.length} px traced, ${res.simple.length} vertices`,
      `${res.holes.length} holes · ${res.holes.map((h) => (h.d * MM_PER_PX).toFixed(1)).join(', ')} mm`,
      `Part ${wmm} × ${hmm} mm · ${lines.length} lines of G-code`,
    ][st];
    readout.textContent = msg;
  }

  function setStage(st, { animate = false } = {}) {
    stage = st;
    steps.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === st)); b.classList.toggle('is-done', i < st); });
    say(st);
    if (st === 4) out.innerHTML = lines.map(hl).join('\n');
    else if (st < 4 && !running) out.innerHTML = '<span class="g-c">; G-code appears here after the scan.</span>';
    cancelAnimationFrame(anim);
    if (!animate || reduced || st === 0) { render(st, 1); return Promise.resolve(); }
    return new Promise((done) => {
      const dur = [0, 900, 1500, 1100, 1300][st];
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, now - t0) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        render(st, e);
        if (st === 4) {
          const k = Math.ceil(lines.length * e);
          out.innerHTML = lines.slice(0, k).map(hl).join('\n');
          out.parentElement.scrollTop = out.parentElement.scrollHeight;
        }
        if (t < 1) anim = requestAnimationFrame(tick); else done();
      };
      anim = requestAnimationFrame(tick);
    });
  }

  async function run() {
    if (running) return;
    running = true; runBtn.disabled = true; newBtn.disabled = true;
    out.innerHTML = '';
    for (let st = 0; st < 5; st++) {
      await setStage(st, { animate: true });
      await new Promise((r) => setTimeout(r, reduced ? 0 : 380));
    }
    out.parentElement.scrollTop = 0;
    running = false; runBtn.disabled = false; newBtn.disabled = false;
    { const r = runBtn.querySelector('.btn__roll'); r.dataset.label = 'Run it again'; r.querySelector('.btn__txt').textContent = 'Run it again'; }
  }

  steps.forEach((b, i) => b.addEventListener('click', () => { if (!running) setStage(i, { animate: true }); }));
  runBtn.addEventListener('click', run);
  newBtn.addEventListener('click', () => { if (running) return; seed = (Math.random() * 1e9) | 0; load(); setStage(0); });

  load();
  setStage(0);
  if (document.fonts) document.fonts.ready.then(() => render(stage, 1));

  // run once, the first time the bench scrolls into view
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { io.disconnect(); setTimeout(run, 400); }
  }, { threshold: 0.5 });
  io.observe(canvas);
}
