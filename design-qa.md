# Design QA — Rio hero artifact test

source visual truth path: `/Users/shaun/.codex/generated_images/019f51b2-d2b2-7e21-a4e1-71fd84a4dd81/exec-553dc603-7a6b-467f-9e5d-e9265fe477e0.png`
implementation screenshot path: `/Users/shaun/Documents/New project/rio-hero-test.png`
viewport: 1280 × 720 browser viewport
state: Rio case study with `?layout=hero-artifact`, light theme, page at scroll top

## Full-view comparison evidence

The implementation preserves the preferred inset composition: large left-aligned outcome headline, right-side project summary and metadata, a centered Rio product visual using its own soft blue gradient, and the existing black metrics band below it without an extra gray container.

## Focused region comparison evidence

The hero visual was checked at the same desktop viewport. The real Rio interface asset loads inside the pale background treatment without an additional hero label or caption. The original “The redesign at a glance” section is also restored after the context row, so the case study keeps its original narrative sequence.

## Findings

No actionable P0, P1, or P2 differences remain for this test layout.

- [P3] The image continues below the first viewport on smaller laptop heights. This is consistent with the source concept's editorial pacing and keeps the headline readable.
  Fix: optional future refinement only; consider a shorter crop if mobile/short-height desktop testing shows the metrics band is too far below the fold.

## Fidelity surfaces

- Fonts and typography: existing portfolio type scale, display weight, tracking, and pink mono labels are retained.
- Spacing and layout rhythm: hero grid, image inset, pale band, and metrics transition follow the source concept.
- Colors and visual tokens: paper, mist, ink, signal pink, and the Rio pale blue gradient are consistent with the supplied visual target and existing site tokens.
- Image quality and asset fidelity: the supplied `/Rio.png` interface is used directly; no placeholder or CSS-drawn replacement is introduced.
- Copy and content: Rio's existing title, summary, metadata, caption, and four metrics are preserved.

## Interaction check

- Loaded the new preview state at `/case-study/rio?layout=hero-artifact`.
- Verified the hero image, metadata, and metrics/context transition in the rendered page.
- No console errors were observed during the browser check.

## Comparison history

1. Initial test used the Rio overview video as the hero artifact; the above-fold area rendered as an empty video frame before playback and did not match the selected source concept closely enough.
2. Updated the test to use the existing Rio interface image from Decision 01, keeping the same content and background treatment. Re-captured the page and verified the visible interface and metrics transition.
3. Compared against `Generated image 2.png`: tested the full-width treatment, then reverted to the preferred inset treatment while keeping the hero visual label-free. Restored the original “The redesign at a glance” section after context and re-captured the page.
4. Removed the redundant outer mist-gray hero background so the Rio artwork's native gradient carries the treatment. Re-captured the page and reran the build check.
5. Removed the test hero's bottom padding so the visual is flush with the black metrics band. Re-captured the join and reran the build check.
6. Added dedicated desktop and mobile hero-asset slots for Rio, with temporary copies of the current image so the test remains functional until the art-directed replacements are ready. Re-captured the desktop state and reran the build check.
7. Aligned tablet and desktop rendering to the same 16:5 crop so one widescreen hero asset is composed and displayed consistently above the mobile breakpoint. Reran the build check.

final result: passed
