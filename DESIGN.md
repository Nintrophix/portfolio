# Design System: Krithiv Shankar (night valley)

Implemented in React + Tailwind v4 (`src/index.css`, brand scale in `@theme`). The site is one dark world: the visitor descends from a mountain range, follows a river past the work, and reaches still water where the contact lives.

## Colour

- One hue family, the green scale `green-50` to `green-950` (Tailwind `green-*` is overridden with the brand values).
- Ground `#0A1610` (`night`). Ink `green-50`, body `green-100`, muted `green-300`.
- One light source: jade `#7FD1B9` (soft `#B2E6D2`). Used for the river, focus rings, active states, small labels. Never as large fills.
- Rules are hairlines: `rgba(211,226,204,.14)` and `.28`. No coloured side borders.
- Dark only. The old light theme and switcher are retired.

## Atmosphere

- **Liquid gradient** (`components/fx/liquid-gradient.tsx`): fixed WebGL field, domain-warped fbm in green-950/900/800 with jade folds, vignette, dither. Renders at 42% resolution, follows the pointer and scroll slowly, pauses when hidden, one still frame under reduced motion.
- **Grain**: static SVG noise, overlay blend, 4.5% opacity.
- **Mountains** (`components/ui/mountain-scene.tsx`): three.js range behind the hero under a lit dawn horizon, pale jade rim light that follows the pointer, sage haze on the far ridges. Pauses off screen.
- **River** (`components/ui/svg-follow-scroll.tsx`): a 2px jade stroke with a faint blurred glow, drawn by scroll behind every chapter, keeping to the margins.
- **Pond** (`components/ui/river-pond.tsx`): deep green water that holds the contact section and footer.

## Type

Swiss-minimal, after the ui-ux-pro-max "Minimalism & Swiss Style" direction, keeping the Archivo + Space Grotesk pairing.

- Display: Archivo at normal width, weight 560 on the variable wght axis, sentence case, -0.03em tracking, 1.0 to 1.1 leading. Name 44 to 112px, chapter titles 32 to 52px, project names 30 to 48px, role titles 22 to 30px.
- Body: Space Grotesk, 16px, lead 17 to 19px. Labels 12 to 14px, weight 500, sentence case. No uppercase, no outline type.
- Mono only for code and measurements.

## Components

- Buttons: 8px radius, 15px sentence-case label, solid `green-100` on dark or hairline outline, rolling label on hover.
- Lists and ledgers over cards: hairline rows (facts, skills ledger, record, contact links). The scan bench and decoder are the only framed panels.

## Motion

- Easing: expo out `cubic-bezier(.16,1,.3,1)`.
- Weight bloom (text reveal, timing from the 21st.dev Cinematic Product Scroll Section): letters of the name and words of each title open from wght 150 to 560 while coming into focus. No position change, no masks.
- Rising terrain: on load the mountain range grows out of flat ground over 2.8s while a dawn horizon fades up behind it.
- Statement: pinned for 300vh; each clause gains weight (180 to 520) and ink at its own scroll threshold.
- Cursor (adapted from 21st.dev Custom Cursor): exact dot plus a spring ring that grows over controls and shows a short label ("Open", "Write") offset from the pointer. Fine pointers only.
- Scroll rail: custom scrollbar fixed at the middle of the right edge, exact thumb, drag, track click, keyboard, chapter ticks. Fine pointers at 768px and up; elsewhere the native bar.
- Reduced motion: every ambient effect stops; content is visible immediately.

## Copy

No em dashes, no emoji, no invented metrics. Facts only from the current résumé; the phone number never appears on the page.
