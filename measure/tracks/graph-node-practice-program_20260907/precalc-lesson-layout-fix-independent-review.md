# Precalculus lesson layout fix independent review

## Verdict

Accept the one-line fix.

Candidate: `/tmp/im1-g50-source-head-20260908.140ok6_u`

## Review

The only change to `apps/pre-calculus/app/layout.tsx` is this import:

`import "katex/dist/katex.min.css";`

The import occurs before `./globals.css`. The application therefore loads the KaTeX base rules for every route. The application-specific `.katex-display` rule remains later in the CSS order.

This change directly fixes the observed cause. The 6,400 px SVG was a KaTeX stretchy SVG with `viewBox="0 0 400000 1080"`. It was not an interval-classification SVG. The lesson renderer uses `@matejmazur/react-katex`, but it does not load the KaTeX stylesheet. The old page received the stylesheet only through an unrelated activity-components import.

The fix does not add a general overflow rule. It does not clip formula content. It does not change interval graph geometry, lesson source, or backend state.

The patch is the minimum correct runtime repair. Root owns the application gates and the live-browser check. I made no candidate or main-worktree edit.
