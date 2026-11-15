# Updates

A running log of changes to the portfolio. Newest first. Dates are in YYYY-MM-DD format.

## 2026-11-16: Night valley

- Rebuilt the site in React, TypeScript and Tailwind, dark only.
- Added a living liquid-gradient background, film grain, and a mountain hero lit by the pointer.
- A river now draws itself down the page as you scroll and ends in the pond that holds the contact section.
- Added cinematic text reveals on the name, chapter titles and project names, and a pinned statement section.
- Added a custom cursor and a custom scrollbar at the middle of the right edge (desktop only).
- Kept every interactive piece: the scan bench, the decoder, the pipelines and the skills ledger.
- Removed the light theme switcher.

## 2026-11-12: November 2026 résumé

- Replaced the downloadable résumé (`public/Krithiv_Shankar_Resume.pdf`) with the November 2026 version.
- Brought every section in line with the new résumé:
  - Irontronics now describes measuring metal parts in millimetres from a camera frame.
  - The scan demo outputs measurements instead of G-code.
  - Logic Play is listed as Core Member (November 2026 to present).
  - Debug Odyssey has a live link, and the level campaign was removed.
  - Lost and Found Hub was added, with live and GitHub links.
  - Education now includes the 12th and 10th board results.
  - Certifications and hackathons were updated.
- Removed the phone number from the page. It still appears in the downloadable PDF, by choice.
- Polish pass: fixed contrast in both themes, enlarged touch targets, and improved the card and pipeline layouts on small screens.

## 2026-10-20: Theme switcher

- Added a light/dark theme toggle built from the green scale. It remembers the visitor's choice and otherwise follows the system setting.

## 2026-10-20: Jade Sky background

- Added the Jade Sky background from 21st.dev, with a night variant for the dark theme.

## 2026-10-19: Modern redesign

- Rebuilt the site on the Krithiv Shankar design system:
  - Type: Archivo display and Space Grotesk body.
  - Visuals: green scale, glass panels and squared buttons.
  - Motion: expo easing.
- The kolam version is preserved on the `kolam` branch.

## 2026-10-19: First version

- Initial kolam-themed portfolio built from the résumé with Vite and vanilla JS.
