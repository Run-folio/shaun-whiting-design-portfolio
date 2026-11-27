# Shaun Whiting portfolio: style guide

Use this for shaunwhiting.com’s homepage, case studies, shared portfolio navigation, and the matching CV. It does not cover Morrovia, the travel demos, or the interfaces shown inside case-study screenshots. This is the agreed styling baseline, not an instruction to redesign other pages.

## Colour

| Role | Value | Use |
| --- | --- | --- |
| Navy | `#1C1B37` | Dark surfaces, primary text on light surfaces, and readable text on turquoise |
| Paper | `#F8F8F6` | Light page surface and light text on navy |
| Turquoise | `#2BF0D7` | Highlights on navy; hover fills, active section underline, and the existing case-study decision treatments |
| Brand pink | `#FF3D8B` | The pink accent Shaun specified: small dots, selected labels and headings, or other agreed accents. Do not substitute a different pink |
| Neutral outline | `#B7B7C4` | The existing 1px carousel-card hover border and outlined Work-menu rows |

**Only turquoise or the agreed pink for visible highlights.** No new green, orange, or off-brand accent variants. Dark green is not a brand-highlight colour: never use it for the contact-link hover. Keep neutral rules, accessible focus indicators, and the original product imagery. Use navy text on bright fills rather than small turquoise or pink text on paper when contrast would be too low. Do not recolour approved states wholesale.

## Type, layout and motion

- Reuse the site's SF Pro/system sans stack and Geist Mono for compact labels. Do not introduce a new font to make one section match.
- Hero: keep **Senior Product Designer** separate from the positioning sentence. The title weight is `550` with `14px` below it. Keep the sentence’s current size and wrapping.
- Desktop: homepage and case-study outer frames share the `120rem` cap from `1100px` upward and the existing responsive gutter. Align the homepage logo, hero, collaborations, first carousel card and contact heading. Keep backgrounds and the dot wave full bleed.
- Keep the circular dot wave and its responsive proportions. On mobile, soften the area behind case-study text rather than shrinking or squashing the wave. Respect reduced-motion settings and keep the static fallback.
- Use a true 1px rule when a divider or outline is specified; avoid fractional strokes in design files. Keep mobile stacking, generous touch targets and visible keyboard focus.

## Homepage

- **Selected collaborations** is the one-line label. Use the existing greyscale brand marks so the work imagery stands out. Don’t change the logo set, order, or attribution without checking the decision.
- Preserve the full-bleed right edge of the desktop carousel: **three full cards plus a peek**, equal image frames, and one-card stepping with a continuous loop. On mobile keep the swipeable rail. Keep controls below the images. Hover is a **1px neutral-grey outline**, with the existing subtle zoom; no thick, bright border.
- Keep current cover imagery and crops: Doddle starts with the desktop SaaS work, Rio with the desktop product, Morrovia with the current homepage, and Amazon with the kiosk image. Farfetch’s direct case URL stays available but it is not in the carousel or Work menu.
- Use one homepage footer. Put Email and LinkedIn below **Let’s talk.**, with the solid LinkedIn mark and no underlines. Their hover uses **turquoise fill + navy text**. Keep **London or UK Remote**, the tagline, and copyright in the right-hand group on desktop; stack them below on mobile.

## Case studies and navigation

- Use the shared wide outer grid for the header, overview and footer. Keep the two-column overview on desktop and retain the original **centred, narrower single-column** decision stories. Do not left-align them to the outer frame. Use the thin neutral divider where the overview leads directly into Decisions.
- Preserve image aspect ratios and original UI; do not crop case-study screenshots to fill a frame. Keep a readable measure for paragraphs. Use ` | ` for labels, e.g. **Doddle | Blue Yonder** and **B2B SaaS | Reverse Logistics**. Do not replace slashes inside paths or terms.
- The Overview / Decisions / Impact menu retains its top grey rule, **no bottom grey rule**, a **2px turquoise active underline**, and **turquoise hover fill** with navy text. Hover must not draw a second underline. Keep keyboard focus distinguishable.
- Decision chips use navy on turquoise. Other existing dark chips use turquoise on navy. Larger existing turquoise callouts use navy text; “Next case study” is turquoise on navy. Preserve approved pink accents such as the case-study label dots.
- The CV link label is **View CV** on desktop and mobile, never Resume. Keep the existing destination unless replacing it with the approved CV. Work dropdown rows use the existing neutral outline, not a filled colour block.

## CV and release checks

- Use the approved, print-friendly A4 CV as the design reference. Keep its copy selectable, hierarchy clear when printed, and links legible on screen. Reuse the portfolio’s visual language without importing dark web backgrounds or decorative motion. Keep Morrovia clearly labelled as an independent side project.
- Before shipping a styling change: check the actual homepage and a representative case at a phone width, laptop width and wide desktop; check keyboard focus, hover and active separately; check image framing, reduced motion and the CV link. If a requested change affects a shared component, verify all affected routes. Mockups are not approval to change other styling.
- Implementation references: [shared tokens](app/globals.css), [homepage](app/folio-home.css), [case-study styling](app/case-study/case-study.css), [navigation](components/portfolio-navigation.css), and [collaboration marks](docs/portfolio-collaborations.md). If the code and this guide disagree on a visible brand choice, flag the mismatch instead of inventing a replacement.
