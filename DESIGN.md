# Design System: Krithiv Shankar

The source of truth is the **Krithiv Shankar Design System** artifact:
https://claude.ai/artifact/7JVXCWopK1tum8Wf76bJd8

This site implements it in plain CSS (`src/style.css`, tokens on `:root`). Summary:

- **Colour:** one hue only, the green scale `--green-50` to `--green-950`. Page `green-100`, text `green-900`, muted `green-700`, emphasis `green-600`. Deep section (Projects) `green-900`, footer `green-950`. Solid fills only, with one deliberate exception: the page background is the **Jade Sky** gradient from 21st.dev (@serafimcloud/jade-sky; #EEF6E3, #B7D98E, #7FBF9A, #CFE9F0), fixed to the viewport behind the glass.
- **Themes:** light (default above) and dark, both from the same green scale. Dark: ground `green-950`, ink `green-50`, muted `green-300`, actions flip to `green-200` on `green-950`, glass `rgba(23,48,26,.72)`, a night Jade Sky in deep greens. A squared 40px switcher in the nav (sun/moon, label rolls) saves the choice in localStorage and follows the system setting until one is picked; an inline head script applies it before first paint.
- **Glass:** panels, cards and the nav are frosted glass (`--glass-bg` / `--glass-bg-strong`, 22px blur, 140% saturate, 1px white edge) sitting over solid green orbs that drift on scroll.
- **Type:** Archivo 900 at 125% width, all caps, 0.86 leading for display. Space Grotesk for body (15px), lead (18px), and small tracked uppercase labels (11px).
- **Buttons:** squared 6px radius, solid `green-800`, one step lighter on hover, rolling label. Never pills.
- **Radii:** 6 buttons, 18 images and stages, 20 nav, 28 cards, 36 panels and section tops.
- **Motion:** expo easing; load intro (letter rise, four-shade line, upward wipe); masked heading slide-ups; scroll-linked outline/solid name bands; orb parallax; scrambling nav labels. All skipped under reduced motion. No custom cursors, no hover scaling.
- **Copy:** no em dashes, no emoji, no invented metrics.
