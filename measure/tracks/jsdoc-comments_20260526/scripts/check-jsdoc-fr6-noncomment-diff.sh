#!/usr/bin/env bash
# Phase 2 FR-6 Non-Comment Diff Guard — Red contract tightener for jsdoc-comments_20260526.
#
# Enforces spec.md FR-6: "Do not change any function signatures, logic, or behavior —
# documentation-only changes." Per measure/tracks/jsdoc-comments_20260526/test-strategy.md
# §4 ("Doc-only invariant"): "git diff --stat should show only added lines that begin
# with `*`, `/**`, or `*/` (plus blank lines). Any non-comment diff line is a violation
# of FR-6."
#
# Background:
# The track ships an arrow-function-to-named-function converter
# (measure/tracks/jsdoc-comments_20260526/scripts/convert-arrows.mjs) which rewrites
# `const foo = () => …` into `function foo() { return …; }` to make functions easier
# to attach JSDoc to. Those rewrites are NOT JSDoc-only edits — they change the function
# declaration style, hoisting semantics, and emit 5+ non-comment +/- diff lines per
# converted function. The Mid role discovered (2026-06-08) that ~309 non-comment +/-
# lines have been emitted into the Phase 2 working tree by an unguarded run of
# convert-arrows.mjs, violating FR-6 even though every function eventually receives a
# JSDoc summary (so the coverage guard passes).
#
# The three pre-existing Phase 2 guards (coverage, line-length, verification) cannot
# detect this regression because they all query the parsed graph or check the artifact —
# none of them inspect the raw git diff. This guard closes the gap.
#
# How it works:
# 1. Compute `git diff <BASE> -- <SCOPE>` (default BASE=HEAD, SCOPE=apps/bus-math-v2/components/)
# 2. Keep only added (+) or removed (-) content lines (skip the +++ / --- file headers).
# 3. Discard lines that look like JSDoc comments — `/**`, ` * …`, ` */`, ` //`, or empty.
# 4. The remaining lines are *source* changes and MUST be zero for FR-6 compliance.
#
# The guard is intended to be run against:
# - The dirty worktree (BASE=HEAD, no extra args) — pre-Green sanity check.
# - The most recent Phase 2 Green commit (BASE=<phase-2-baseline-sha> via FR6_BASE env)
#   to verify the committed implementation is FR-6 compliant.
#
# Lives under measure/tracks/<track>/scripts/ — Measure-owned test artifact, not application
# source. Honors the Red-phase boundary: tests + Measure docs only, no application code edits.
#
# Per test-strategy.md §1, this is the "Graph delta checks" tier (the only tier that can
# inspect raw diffs since vitest doesn't see git state). It is intentionally a shell guard,
# NOT a vitest file (the strategy explicitly bans new vitest files for doc text).
#
# Exit codes:
#   0 = pass (zero non-comment +/- diff lines in scope vs base)
#   1 = fail (one or more non-comment +/- diff lines — FR-6 violation count printed)
#   3 = misuse (missing git, unreadable scope)
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-fr6-noncomment-diff.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-fr6-noncomment-diff.sh --json
#   FR6_BASE=23ab09e2 bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-fr6-noncomment-diff.sh
#
# Configuration (env overrides):
#   FR6_BASE    : git ref to diff against (default HEAD)
#   FR6_SCOPE   : path filter for git diff (default apps/bus-math-v2/components/)
#   FR6_LIMIT   : how many violating files to print in human mode (default 25)

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
FR6_BASE="${FR6_BASE:-HEAD}"
FR6_SCOPE="${FR6_SCOPE:-apps/bus-math-v2/components/}"
FR6_LIMIT="${FR6_LIMIT:-25}"
PHASE_LABEL="Phase 2 (BM2 components/)"

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

if ! command -v git >/dev/null 2>&1; then
    echo "ERROR: git not on PATH" >&2
    exit 3
fi

cd "${REPO_ROOT}"
read -r -a FR6_SCOPE_PATHS <<< "${FR6_SCOPE}"

# Total non-comment +/- lines across all files in scope.
# A line is treated as a JSDoc/comment line if its body (after the +/- prefix) is:
#   - empty (only the +/- prefix)
#   - a block-comment line: starts with optional whitespace then `*` or `//` or `/**` or `*/` or `/`
# Everything else is a *source* change and counted as a violation.
VIOLATION_LINES=$(git diff "${FR6_BASE}" -- "${FR6_SCOPE_PATHS[@]}" 2>/dev/null \
    | grep -E '^[+-]' \
    | grep -vE '^[+-]{3}' \
    | grep -vE '^[+-]\s*$' \
    | grep -vE '^[+-]\s*(\*|//|/\*\*|\*/|/)' \
    | wc -l | tr -d ' ')

# Per-file breakdown for human mode.
declare -a VIOLATING_FILES=()
if [ "${VIOLATION_LINES}" != "0" ]; then
    while IFS= read -r f; do
        [ -z "${f}" ] && continue
        count=$(git diff "${FR6_BASE}" -- "${f}" 2>/dev/null \
            | grep -E '^[+-]' \
            | grep -vE '^[+-]{3}' \
            | grep -vE '^[+-]\s*$' \
            | grep -vE '^[+-]\s*(\*|//|/\*\*|\*/|/)' \
            | wc -l | tr -d ' ')
        if [ "${count}" != "0" ]; then
            VIOLATING_FILES+=("${count} ${f}")
        fi
    done < <(git diff --name-only "${FR6_BASE}" -- "${FR6_SCOPE_PATHS[@]}" 2>/dev/null)
fi

if [ "${JSON_MODE}" = "1" ]; then
    files_json="["
    first=1
    for entry in "${VIOLATING_FILES[@]:-}"; do
        [ -z "${entry}" ] && continue
        count="${entry%% *}"
        path="${entry#* }"
        if [ "${first}" = "1" ]; then first=0; else files_json+=","; fi
        files_json+="{\"file\":\"${path}\",\"violations\":${count}}"
    done
    files_json+="]"
    printf '{"phase":"%s","scope":"%s","base":"%s","violation_lines":%d,"pass":%s,"files":%s}\n' \
        "${PHASE_LABEL}" "${FR6_SCOPE}" "${FR6_BASE}" "${VIOLATION_LINES}" \
        "$([ "${VIOLATION_LINES}" = "0" ] && echo true || echo false)" \
        "${files_json}"
else
    echo "FR-6 Non-Comment Diff Guard — ${PHASE_LABEL}"
    echo "==============================================="
    echo "Scope:                ${FR6_SCOPE}"
    echo "Base ref:             ${FR6_BASE}"
    echo "Violation lines:      ${VIOLATION_LINES}"
    echo ""
    if [ "${VIOLATION_LINES}" = "0" ]; then
        echo "PASS: Zero non-comment +/- diff lines in ${FR6_SCOPE} vs ${FR6_BASE}."
        echo "FR-6 invariant (no signature/logic changes) holds."
    else
        echo "FAIL: ${VIOLATION_LINES} non-comment +/- diff line(s) in ${FR6_SCOPE} vs ${FR6_BASE}."
        echo ""
        echo "Per spec.md FR-6: 'Do not change any function signatures, logic, or behavior —"
        echo "documentation-only changes.' Per test-strategy.md §4 (doc-only invariant):"
        echo "any non-comment +/- diff line is an FR-6 violation."
        echo ""
        echo "Top ${FR6_LIMIT} violating files (violation_count file_path):"
        printf '%s\n' "${VIOLATING_FILES[@]:-}" | sort -nrk 1 | head -n "${FR6_LIMIT}"
        echo ""
        echo "Reproduce manually:"
        echo "  git diff ${FR6_BASE} -- ${FR6_SCOPE} | grep -E '^[+-]' \\"
        echo "    | grep -vE '^[+-]{3}' | grep -vE '^[+-]\\s*\$' \\"
        echo "    | grep -vE '^[+-]\\s*(\\*|//|/\\*\\*|\\*/|/)' | wc -l"
        echo ""
        echo "Common root cause: convert-arrows.mjs has been run against the scope; the"
        echo "arrow-function-to-named-function rewrites are NOT FR-6-safe and must be"
        echo "reverted before any Phase 2 Green commit."
    fi
fi

if [ "${VIOLATION_LINES}" = "0" ]; then
    exit 0
fi
exit 1
