import { useEffect, useRef } from "react";

/**
 * LiquidGradient: the living ground of the page.
 * Adapted from the 21st.dev "Liquid Gradient" idea (a slow, domain-warped
 * colour field on a single fragment shader), re-tuned to the green scale:
 * green-950 ground, green-900/800 currents and one cold jade light.
 * Rendered at a fraction of the viewport resolution (the field is soft, so
 * nothing is lost), paused when the tab is hidden, and frozen to a single
 * frame under prefers-reduced-motion.
 */

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  p.y += uScroll * 0.35;           // the field drifts up as you descend the page
  float t = uTime * 0.035;

  // two levels of domain warping give the "liquid" folds
  vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, t)), fbm(p * 1.4 + vec2(5.2, 1.3) - t));
  vec2 m = (uMouse - 0.5) * vec2(0.6, -0.6);
  vec2 r = vec2(fbm(p * 1.2 + 3.0 * q + vec2(1.7, 9.2) + 0.6 * t + m),
                fbm(p * 1.2 + 3.0 * q + vec2(8.3, 2.8) - 0.4 * t - m));
  float f = fbm(p * 1.1 + 3.2 * r);

  vec3 ground = vec3(0.055, 0.110, 0.074);   // green-950, lifted a touch
  vec3 g900   = vec3(0.090, 0.188, 0.102);   // green-900
  vec3 g800   = vec3(0.157, 0.278, 0.153);   // green-800
  vec3 jade   = vec3(0.290, 0.560, 0.470);   // the river's cold light
  vec3 col = ground;
  col = mix(col, g900, smoothstep(0.25, 0.75, f));
  col = mix(col, g800, smoothstep(0.4, 0.95, length(q)) * 0.8);
  col = mix(col, jade, pow(smoothstep(0.45, 1.0, r.x * f * 1.7), 2.0) * 0.5);

  // vignette keeps the edges in shadow and the reading area calm
  float v = smoothstep(1.25, 0.25, length((uv - vec2(0.5, 0.45)) * vec2(1.1, 1.3)));
  col *= mix(0.55, 1.0, v);

  // dither to kill banding in the dark ramps
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

const SCALE = 0.42; // fraction of CSS pixels the field renders at

export function LiquidGradient() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // the CSS ground underneath stays as the fallback

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let scroll = 0;
    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      const w = Math.max(1, Math.round(innerWidth * SCALE));
      const h = Math.max(1, Math.round(innerHeight * SCALE));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const draw = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;
      const target = scrollY / Math.max(1, innerHeight);
      scroll += (target - scroll) * 0.08;
      gl.uniform1f(uTime, reduced ? 12 : (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced) draw(performance.now());
      else raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / innerWidth;
      mouse.ty = e.clientY / innerHeight;
    };
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    const onResize = () => {
      resize();
      if (reduced) draw(performance.now());
    };
    const onScrollStatic = () => {
      if (!reduced) return;
      scroll = scrollY / Math.max(1, innerHeight);
      draw(performance.now());
    };

    resize();
    start();
    addEventListener("resize", onResize);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScrollStatic, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScrollStatic);
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 h-full w-full"
    />
  );
}

export default LiquidGradient;
