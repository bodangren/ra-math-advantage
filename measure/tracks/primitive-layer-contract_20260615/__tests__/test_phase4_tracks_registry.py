"""Phase 4 — Generate Docs & Doctor Red-phase test for the FR-6 registry deliverable.

The deliverable of `spec.md` FR-6 is the `measure/tracks.md` registry edit:
  1. Add the **Practice Primitives & Components Program** section (T0 + A-F).
  2. Edit the T15 entry (folded into C/D) and T16 entry (reframed as Track E seed).

This is an **artifact / contract** test (test-strategy.md §4/§5/§7). The phase
deliverable IS the static markdown registry edit, not a runtime behavior, so
artifact assertions are allowed by the session contract. The **live-behavior
proof** for Phase 4 closeout is the quality-gate run in Phase 4 Task 2
(`npx tsc --noEmit` + `npm run lint` + `CI=true npm run test` in
`packages/activity-components`), which the Green role owns per
test-strategy.md §7. Mid does not run the full live-behavior proof in this
commit; this test proves the missing registry annotations and hands off to
Green for the registry edit + live gate.

Per the session instruction "Red tests must fail because the current
implementation is missing or wrong, not merely because a durable record is
stale," the missing T15 fold annotation and T16 Track E reframe annotation
are the *current* implementation gap in this track (sub-task 2 of FR-6 is
not yet complete), so this is a real Red signal — not a stale-record
artifact.

Bounded Red command (no watch mode, no full-suite smoke):

    cd /home/daniel-bo/Desktop/ra-math-advantage && \\
      python3 -m pytest -v \\
        measure/tracks/primitive-layer-contract_20260615/__tests__/test_phase4_tracks_registry.py
"""

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
TRACKS_MD = REPO_ROOT / "measure" / "tracks.md"


def _read_tracks_md() -> str:
    return TRACKS_MD.read_text(encoding="utf-8")


def _extract_entry_block(text: str, track_label: str) -> str:
    """Extract the T<NN> entry block by its bold bullet label.

    `tracks.md` entries follow the pattern (4-space-indented under a Program
    heading):
            - [ ] **Track 15: <name>**
               *<description line 1>*
               *Link: [...]*
    The block ends at the next same-or-higher-indent bullet, a `##` heading,
    or EOF.
    """
    pattern = re.compile(
        r"^[ \t]*- \[[ x]\] \*\*" + re.escape(track_label) + r":[\s\S]*?"
        r"(?=\n[ \t]*- \[[ x]\] \*\*|\n## |\Z)",
        re.MULTILINE,
    )
    match = pattern.search(text)
    return match.group(0) if match else ""


class Phase4FR6TracksRegistryTest(unittest.TestCase):
    """Spec: spec.md FR-6 — T15/T16 reconciliation + program registration."""

    def test_program_section_header_present(self) -> None:
        text = _read_tracks_md()
        self.assertIn(
            "Practice Primitives & Components Program",
            text,
            "tracks.md must contain the FR-6 program section header "
            "(already satisfied at HEAD — sub-task 1 evidence, not the Red target)",
        )

    def test_t0_and_tracks_a_through_f_registered(self) -> None:
        text = _read_tracks_md()
        self.assertIn("**T0: Primitive Layer Contract**", text)
        for letter in ("A", "B", "C", "D", "E", "F"):
            with self.subTest(track_letter=letter):
                self.assertRegex(
                    text,
                    r"\*\*Track " + letter + r":",
                    f"tracks.md must register Track {letter} in the program "
                    "(already satisfied at HEAD — sub-task 1 evidence)",
                )

    def test_t15_entry_annotated_as_folded_into_c_or_d(self) -> None:
        text = _read_tracks_md()
        block = _extract_entry_block(text, "Track 15")
        self.assertTrue(block, "T15 entry block not found in tracks.md")
        self.assertRegex(
            block,
            r"(?i)\b(folds? into|folded into|absorbed by|merged into|scope folded into)\b"
            r"[^.\n]{0,120}\b(Track [CD]|Tracks [CD]|Tracks C and D|C/D)\b",
            "T15 entry must annotate the fold into Track C and/or Track D "
            "per spec FR-6 sub-bullet 2",
        )

    def test_t16_entry_annotated_as_track_e_seed(self) -> None:
        text = _read_tracks_md()
        block = _extract_entry_block(text, "Track 16")
        self.assertTrue(block, "T16 entry block not found in tracks.md")
        self.assertRegex(
            block,
            r"(?i)\b(seed|refram|absorbed by|merged into)\b"
            r"[^.\n]{0,120}\bTrack E\b",
            "T16 entry must annotate the reframe as the seed of Track E "
            "per spec FR-6 sub-bullet 2",
        )


if __name__ == "__main__":
    unittest.main()
