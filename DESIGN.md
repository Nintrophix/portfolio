---
name: Krithiv Shankar
description: A kolam threshold. One rice-flour line weaves a pulli dot grid on a red-oxide floor and bends around everything placed on it.
colors:
  oxide: "#8a2b1c"
  oxide-deep: "#6c1f14"
  oxide-hi: "#a43a26"
  stone: "#1c1714"
  stone-2: "#2a221d"
  ink-well: "#0f0c0a"
  flour: "#f5efe4"
  flour-dim: "#f0e2d8"
  flour-stone: "#c9bdb0"
  turmeric: "#f0aa1e"
  kumkum: "#e8456f"
  leaf: "#5fb37a"
typography:
  display:
    fontFamily: "Anek Tamil, Hind Madurai, system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 9vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 118"
  headline:
    fontFamily: "Anek Tamil, Hind Madurai, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.6vw, 3.5rem)"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 108"
  headline-big:
    fontFamily: "Anek Tamil, Hind Madurai, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 5rem)"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 108"
  title:
    fontFamily: "Anek Tamil, Hind Madurai, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.4vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 120"
  label:
    fontFamily: "Anek Tamil, Hind Madurai, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 750
    lineHeight: 1.3
    letterSpacing: "normal"
    fontVariation: "\"wdth\" 118"
  lead:
    fontFamily: "Hind Madurai, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.5vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Hind Madurai, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Hind Madurai, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  pill: "999px"
  bench: "22px"
  stage: "14px"
  well: "12px"
  row: "10px"
  tag: "8px"
spacing:
  pulli: "44px"
  pulli-mobile: "34px"
  pulli-wide: "50px"
  gutter: "clamp(16px, 4vw, 56px)"
  wrap: "1200px"
  section: "calc(var(--pulli) * 3)"
  section-tight: "calc(var(--pulli) * 2.25)"
components:
  button-flour:
    backgroundColor: "{colors.flour}"
    textColor: "{colors.oxide-deep}"
    rounded: "{rounded.pill}"
    padding: "0 1.3em"
    height: "48px"
  button-flour-on-stone:
    backgroundColor: "{colors.flour}"
    textColor: "{colors.stone}"
    rounded: "{rounded.pill}"
    padding: "0 1.3em"
    height: "48px"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.flour}"
    rounded: "{rounded.pill}"
    padding: "0 1.3em"
    height: "48px"
  chip:
    backgroundColor: "rgba(28, 23, 20, .32)"
    textColor: "{colors.flour}"
    rounded: "{rounded.pill}"
    padding: ".5em 1em"
    height: "40px"
  nav-link:
    textColor: "{colors.flour}"
    rounded: "{rounded.pill}"
    padding: "10px 14px"
  bench:
    backgroundColor: "{colors.stone-2}"
    rounded: "{rounded.bench}"
    padding: "22px"
  code-well:
    backgroundColor: "{colors.ink-well}"
    textColor: "{colors.flour-stone}"
    typography: "{typography.mono}"
    rounded: "{rounded.well}"
    padding: "14px 16px"
  tab-selected:
    backgroundColor: "{colors.flour}"
    textColor: "{colors.stone}"
    rounded: "{rounded.pill}"
    padding: "8px 18px"
  step-row:
    textColor: "{colors.flour-stone}"
    rounded: "{rounded.row}"
    padding: "9px 10px"
  ledger-row:
    textColor: "{colors.flour}"
    typography: "{typography.label}"
    padding: "18px 4px"
---

# Design System: Krithiv Shankar

## Overview

**Creative North Star: "The Kolam Threshold"**

The page is a doorstep floor. A drenched red-oxide ground carries a pulli dot grid, and a single rice-flour line runs across it, bouncing off mirrors and bending around whatever is placed on the floor: the name block, the copy, the next section. Working surfaces (the internship bench, the decoder, the record) are set on wet-stone near-black, the way tools sit on a slab beside the threshold. Festival powders (turmeric, kumkum, leaf) only appear as extra loops of the line and as state.

Density is generous and rhythmic: every section is measured in pulli modules, and lists are set as fixed-column ledger rows separated by hairline flour rules rather than as cards. Type is a heavy, expanded Tamil-script display face over a plain humanist body, with monospace reserved for machine output. Depth is shallow: flour lifts off the floor with a soft shadow, benches rest on a long ambient shadow, and nothing floats.

**Key Characteristics:**
- Red-oxide floor (drenched, full-bleed) with stone benches for interactive work.
- One continuous flour line on a pulli dot grid as the signature, reused as the hero, as a band opening each section, and as a faded floor under the close.
- All vertical rhythm in multiples of the pulli module.
- Records and lists as ledger rows with hairline rules, not cards.
- Pill-shaped controls; rounded benches; square ledger rows.
- Accent powders mark state and extra loops only.

## Colors

A two-ground palette (oxide floor, stone bench) with one ink (flour) and three powders used sparingly.

### Primary
- **Red-Oxide Floor** (oxide): The body background, the close section, and the floor node fill in the Friday path. The page is drenched in it.
- **Deep Oxide** (oxide-deep): The skills ledger section, the mobile menu, scrolled nav (at 92% opacity), button text on flour, scrollbar track.
- **Oxide Highlight** (oxide-hi): Only the warm center of the hero's radial floor gradient (oxide-hi to oxide to oxide-deep).

### Secondary
- **Wet Stone** (stone): Section ground for working benches (internship, record) and the decoder panel; text on flour surfaces.
- **Stone Slab** (stone-2): The raised bench (rig) and the decoder tab track.
- **Ink Well** (ink-well): Recessed wells inside benches: the rig stage, G-code and code panes.

### Tertiary (powders)
- **Turmeric** (turmeric): Active state (pressed pipeline step, lit flow node, travelling pulse), focus outline, selection, the campaign path, G-code commands, the "used in the work" dot, the hot record stamp.
- **Kumkum** (kumkum): Error highlight and keywords in code panes; a kolam loop colour.
- **Leaf** (leaf): Success highlight in code panes; a kolam loop colour.

### Neutral
- **Rice Flour** (flour): All primary text, the kolam line and dots, hairline rules (at 14 to 30% alpha), the filled button, the selected tab, the toast.
- **Flour on Oxide** (flour-dim): Secondary text on oxide grounds (meta, hints, captions, sub-labels).
- **Flour on Stone** (flour-stone): Secondary text on stone grounds and inside code wells; idle pipeline steps.

### Named Rules
**The One Ink Rule.** Flour is the only ink. Text, line, dots, rules and primary buttons are all flour or flour at reduced alpha; there is no second neutral text colour beyond the two ground-specific secondaries.

**The Powder Rule.** Turmeric, kumkum and leaf mark state, code semantics, or an extra kolam loop. They never fill a surface or set a heading.

**The Ground-Matched Secondary Rule.** Secondary text uses flour-dim on oxide and flour-stone on stone. Never swap them.

## Typography

**Display Font:** Anek Tamil (with Hind Madurai, system-ui)
**Body Font:** Hind Madurai (with system-ui)
**Label/Mono Font:** JetBrains Mono, only for G-code, code panes, the rig readout and canvas labels.

**Character:** A heavy, width-axis-expanded Tamil-script display face carries the threshold's voice; Hind Madurai keeps body copy plain and readable. Width is a deliberate axis: the larger and more declarative the text, the wider it is set.

### Hierarchy
- **Display** (800, clamp(3.4rem, 9vw, 6rem), 0.9, wdth 118): The hero name and the closing line only. Balanced wrapping.
- **Headline** (750, clamp(2.1rem, 4.6vw, 3.5rem), 1, wdth 108): Section titles. The projects section uses the big step (clamp(2.6rem, 6.4vw, 5rem)).
- **Title** (800, clamp(2.4rem, 5.4vw, 4.25rem), 0.95, wdth 120): Project names.
- **Label** (750, about 1.05 to 1.35rem, wdth 110 to 120): Ledger keys, fact keys, record group heads, contact link names, flow step names, nav mark. This is the display face at small size, never small caps or tracked uppercase.
- **Lead** (400, clamp(1.125rem, 1.5vw, 1.3rem), 1.55, max 62ch): The first paragraph of each section or project.
- **Body** (400, 1.0625rem, 1.6, max 70ch; 1rem under 640px).
- **Meta** (400, 0.9 to 0.98rem): Roles, dates, captions, hints; set in the ground-matched secondary colour with a flour strong for the key noun.
- **Mono** (400, 0.8 to 0.85rem, 1.6 to 1.7): Machine output only.

### Named Rules
**The Width Means Weight Rule.** Display text is always set with the width axis opened (wdth 104 to 120) and negative tracking (-0.01 to -0.035em). Never set Anek Tamil at default width for a heading.

**The Machine Voice Rule.** Monospace appears only where a machine is speaking (G-code, compiler output, readouts). Never use it for labels, dates, or decoration.

## Layout

A single centred column (min(1200px, 100vw minus two gutters)) with fluid gutters (clamp(16px, 4vw, 56px)). The pulli module is 44px, dropping to 34px under 640px and rising to 50px from 1280px; the kolam canvases read it from the CSS variable, so grid and type rhythm stay locked together.

Section padding is a pulli multiple: 3 modules for full sections, 2.25 for ledger sections, 2.5 at the close. Each section after the hero opens with a kolam band two modules tall, pulled up 1.5 modules into the section seam. Project blocks pad 1.5 modules above and 2 below.

Two-column compositions are asymmetric: the bench is 1.6fr to 1fr, the Debug Odyssey body splits 1fr to 1fr with a sticky decoder. Ledger rows use a fixed key column (9rem facts, 11rem skills, 13rem record dates, 9rem contact names) and a flexible value column. Breakpoints: 960px collapses two-column bodies; 820px swaps nav links for the menu toggle; 640px stacks ledger rows and turns the Friday path vertical.

### Named Rules
**The Pulli Rule.** Vertical rhythm between and inside sections is a multiple of the pulli module. Do not introduce free pixel section spacing.

## Elevation & Depth

Shallow and ambient. Surfaces are flat at rest; depth comes from ground changes (oxide to stone to stone slab to ink well, each recessed further) plus a few long, soft, negative-spread shadows. The kolam line itself carries a tiny drop shadow so the flour reads as powder lying on the floor.

### Shadow Vocabulary
- **Flour on floor** (canvas shadow, 0 1.5px 3px rgba(40, 8, 4, .35)): The kolam line on every canvas.
- **Bench rest** (`box-shadow: 0 30px 60px -40px rgba(0,0,0,.8)`): The rig; the decoder uses the oxide-tinted variant rgba(20,6,2,.9).
- **Button lift** (`box-shadow: 0 8px 20px -8px rgba(20, 6, 2, .6)`): Flour button on hover, with a 2px rise.
- **Nav settle** (`box-shadow: 0 6px 24px -14px rgba(0,0,0,.6)`): Nav once scrolled.
- **Toast** (`box-shadow: 0 10px 30px -10px rgba(0,0,0,.5)`).
- **Active ring** (`box-shadow: 0 0 0 4px rgba(240, 170, 30, .22)`): The pressed pipeline step's dot.

### Named Rules
**The Recess Rule.** Things get darker as they go deeper (stone, stone slab, ink well). Shadows are long, soft and negative-spread; never hard, offset, or coloured outlines.

## Shapes

Three silhouettes. Controls are full pills (999px): buttons, chips, nav links, tabs, the toast. Working surfaces are softly rounded: benches 22px, stage 14px, wells 12px, step rows 10px, readouts and tags 8px. Ledger rows (facts, skills, record, contact links) are square and unbounded, defined only by hairline flour rules top and bottom. Circles carry meaning: pulli dots, flow nodes, step dots, the menu toggle. Strokes are round-capped and round-joined everywhere (line art, icons, paths).

## Components

### Buttons
Tactile, pill-shaped and outlined in flour.
- **Shape:** Full pill (999px), 48px minimum height, 1.5px flour border, 600 weight 1rem, icon gap 0.55em.
- **Flour (primary):** Flour fill, deep-oxide text on oxide grounds, stone text on stone benches.
- **Line (secondary):** Transparent with flour border and text.
- **Hover / Focus:** Rise 2px over 0.25s on the ease-out curve; flour brightens to white with the button-lift shadow; line fills with flour at 12%. Active returns to rest. Focus is a 2px turmeric outline offset 3px.
- **Disabled:** 50% opacity, progress cursor.

### Chips
- **Style:** Stone at 32% alpha over the floor, 1px flour border at 35%, pill, 40px tall, 0.92rem 500, 16px stroked icon.
- **State:** Hover deepens to 55% stone and the border goes full flour.

### Cards / Containers
- **Corner Style:** Bench 22px; inner stage 14px; wells 12px.
- **Background:** Stone slab bench on a stone section; ink-well panes inside.
- **Shadow Strategy:** Bench rest (see Elevation & Depth).
- **Border:** None.
- **Internal Padding:** 22px (14px under 960px), 24px column gap.

### Navigation
Fixed, transparent over the hero, 14px by gutter padding. The mark is a kolam glyph (four pulli dots and a woven line) that rotates 45 degrees on hover, beside the name in the display face at wdth 115. Links are 0.98rem 500 pills; hover is flour at 12%, current section flour at 16%; the contact link carries a 1.5px flour outline. Once scrolled the bar fills with deep oxide at 92% (stone at 92% over stone sections). Under 820px a 48px round outlined toggle opens a full-screen deep-oxide menu of display-face links (800, wdth 118, clamp(2.4rem, 11vw, 3.4rem)).

### Ledger Rows (signature)
The fixed-column record. Key column in the label style (display face, 750, wide), value column in body or secondary text, hairline flour rules at 14 to 30% alpha between rows, 16 to 18px vertical padding, no fill. Used for facts, skills, the record, and contact links. Contact rows add a leading 24px stroked icon, a sub-value in flour-dim, and a trailing arrow that nudges up and right on hover while the row indents 8px over a faint stone wash. Skills entries that appear in the work carry a 5px turmeric dot and invert to flour on hover or focus.

### Pipeline Steps and Tabs
Step rows are 10px-rounded buttons with a 12px ring dot: idle in flour-stone, done with a filled flour dot, pressed with a turmeric-tinted row, turmeric dot and active ring. Decoder tabs sit in a stone-slab pill track; the selected tab is a flour pill with stone text.

### Code Well
Ink-well panes, 12px radius, mono at 0.8 to 0.84rem. Comments recede, commands in turmeric, keywords kumkum, success leaf; error and fix ranges get an 18% kumkum or leaf wash with a 2px matching halo.

### Kolam Canvas (signature)
A pulli dot grid (dots at flour 82%, radius max(1.6px, 5.5% of the module)) with mirror-curve loops stroked at max(2px, 6% of the module), round caps and joins. The first loop is flour; extra loops cycle turmeric, kumkum, leaf. Cells under text are excluded so the line bends around copy. Lines "pour" in along their length on a cubic ease-out (about 1.8 to 3.2s) the first time they enter view and never redraw on re-entry; reduced motion shows them complete. Placed full-bleed in the hero (interactive, crosshair cursor, a turmeric ring flashes where a mirror is placed), as a two-module band opening each section, and at 55% opacity under the close.

## Do's and Don'ts

### Do:
- **Do** set every section's vertical spacing in pulli multiples (3 for full sections, 2.25 for ledgers).
- **Do** put interactive work on stone, recessed in steps (stone, stone-2, ink-well), and keep narrative on oxide.
- **Do** set lists and records as ledger rows with hairline flour rules and a fixed key column.
- **Do** open the display face's width axis (wdth 104 to 120) with negative tracking for every heading.
- **Do** use turmeric for the single active state in any group, and for focus (2px outline, 3px offset).
- **Do** let the kolam line route around content and pour in once; show it complete under reduced motion.
- **Do** use the ground-matched secondary text colour (flour-dim on oxide, flour-stone on stone).

### Don't:
- **Don't** set the projects, record, or contact as a grid of cards; they are ledger rows.
- **Don't** use turmeric, kumkum or leaf as a surface fill or heading colour.
- **Don't** use JetBrains Mono outside machine output.
- **Don't** set small turmeric text directly on the oxide floor; it falls below 4.5:1. Turmeric text belongs on stone or ink-well.
- **Don't** use hard offset shadows or coloured outline shadows; depth is ground recession plus long soft shadows.
- **Don't** introduce a second line style; there is one flour line, round-capped, weaving a dot grid.
