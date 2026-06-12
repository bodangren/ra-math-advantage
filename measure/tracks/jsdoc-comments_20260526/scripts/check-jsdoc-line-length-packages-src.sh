#!/usr/bin/env bash
# Phase 8 JSDoc Line-Length Guard — Red baseline supplement for jsdoc-comments_20260526.
#
# Enforces NFR-1 (spec.md §Non-Functional Requirements): "JSDoc comments must not exceed
# 120 chars per line." Existing ESLint config does NOT enforce line length on comments
# (test-strategy.md §3), so this shell guard is the per-phase check the strategy calls for.
#
# Sibling to check-jsdoc-line-length.sh (Phase 1 BM2 lib/),
# check-jsdoc-line-length-components.sh (Phase 2 BM2 components/),
# check-jsdoc-line-length-remaining.sh (Phase 3 BM2 app/convex/scripts/other),
# check-jsdoc-line-length-convex-im3.sh (Phase 4 IM3 convex/),
# check-jsdoc-line-length-components-im3.sh (Phase 5 IM3 components/),
# check-jsdoc-line-length-im3-lib.sh (Phase 6 IM3 lib/), and
# check-jsdoc-line-length-im3-app.sh (Phase 7 IM3 app/scripts/other). Same regex shape,
# different scope — kept as a separate file so the per-phase acceptance gate stays a
# single command and so the JSON output reports the right phase label.
#
# Phase 1 added this guard as a Task 1.4 supplement AFTER Tasks 1.1–1.3 were Green, and
# four long-`@param` lines slipped past Phase 1. From Phase 2 onward the guard is included
# from the start as a regression net.
#
# Phase 8 Red baseline is **2 pre-existing violations** in scope (modes.ts:20 is a
# genuine JSDoc continuation; fixtures.ts:130 is a markdown literal inside a TS test
# fixture that the awk heuristic flags because the line starts with `**`). Green
# acceptance requires both to be fixed (one genuine wrap, one either wrap or refactor)
# in addition to keeping the count at 0 after Tasks 8.1 + 8.2 add JSDoc to the 351
# undocumented functions in `packages/*/src/`. See phase-8-red-baseline.md §"NFR-1
# line-length supplement" for the per-violation remediation plan.
#
# Per test-strategy.md §3, Phase 8 includes pure-TS shared libraries (math-content,
# knowledge-space-core, srs-engine, practice-core, activity-components, etc.) with many
# internal helper chains. The `__tests__/` subdirs under `packages/*/src/` are co-located
# test files (per packages' vitest conventions) and are intentionally included in this
# scope to match the coverage guard's `file_path LIKE '%/packages/%/src/%'` SQL — the
# line-length invariant applies wherever JSDoc exists, and excluding test files would
# create a scope mismatch between the two Phase 8 guards. Common pitfall: JSDoc on a
# pure-TS utility function in math-content can grow long when the @param description
# includes a format example or when the @returns describes a tagged-union return type.
#
# Lives under measure/tracks/<track>/scripts/ — Measure-owned test artifact, not application
# source. Honors the Red-phase boundary: tests + Measure docs only, no application code edits.
#
# Per test-strategy.md §1, this is the "Static guards (largest)" tier — a shell guard, NOT a
# vitest file (the strategy explicitly bans new vitest files for doc text).
#
# Exit codes:
#   0 = pass (zero JSDoc lines > MAX_CHARS in scope)
#   1 = fail (one or more JSDoc continuation lines exceed MAX_CHARS — list printed)
#   3 = misuse (missing dependency / unreadable scope)
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-packages-src.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-packages-src.sh --json
#
# Configuration (env overrides):
#   MAX_CHARS  : line-length cap (default 120, per NFR-1)
#   SCOPE_ROOT : root dir under which to scan (default packages)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
MAX_CHARS="${MAX_CHARS:-120}"
SCOPE_ROOT="${SCOPE_ROOT:-${REPO_ROOT}/packages}"
SCOPE_LABEL="${SCOPE_ROOT#${REPO_ROOT}/}"
PHASE_LABEL="Phase 8 (Packages src/)"

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

if [ ! -d "${SCOPE_ROOT}" ]; then
    echo "ERROR: scope root not found: ${SCOPE_ROOT}" >&2
    exit 3
fi

if ! command -v awk >/dev/null 2>&1; then
    echo "ERROR: awk not on PATH" >&2
    exit 3
fi

VIOLATIONS_FILE="$(mktemp)"
trap 'rm -f "${VIOLATIONS_FILE}"' EXIT

# Scan every .ts / .tsx file under packages/*/src/. Skip node_modules / .next / .wrangler / dist
# / .d.ts noise. __tests__/ co-located test files are included (same scope as the coverage guard)
# because the NFR-1 invariant applies wherever JSDoc exists; excluding them would create a scope
# mismatch between the two Phase 8 guards.
find "${SCOPE_ROOT}" -type f \( -name '*.ts' -o -name '*.tsx' \) \
    -not -path '*/node_modules/*' \
    -not -path '*/.next/*' \
    -not -path '*/.wrangler/*' \
    -not -path '*/dist/*' \
    -not -name '*.d.ts' \
    -print0 \
    | xargs -0 awk -v max="${MAX_CHARS}" '
        /^[[:space:]]*\/\*\*/ || /^[[:space:]]*\*/ || /^[[:space:]]*\*\// {
            if (length($0) > max) {
                rel = FILENAME
                printf "%s:%d:%d\n", rel, FNR, length($0)
            }
        }
    ' > "${VIOLATIONS_FILE}" 2>/dev/null || true

VIOLATION_COUNT=$(wc -l < "${VIOLATIONS_FILE}" | tr -d ' ')

if [ "${JSON_MODE}" = "1" ]; then
    printf '{"phase":"%s","scope":"%s","max_chars":%d,"violation_count":%d,"pass":%s,"violations":[' \
        "${PHASE_LABEL}" "${SCOPE_LABEL}" "${MAX_CHARS}" "${VIOLATION_COUNT}" \
        "$([ "${VIOLATION_COUNT}" = "0" ] && echo true || echo false)"
    first=1
    while IFS=: read -r f l n; do
        [ -z "${f}" ] && continue
        rel="${f#${REPO_ROOT}/}"
        if [ "${first}" = "1" ]; then
            first=0
        else
            printf ','
        fi
        printf '{"file":"%s","line":%s,"length":%s}' "${rel}" "${l}" "${n}"
    done < "${VIOLATIONS_FILE}"
    printf ']}\n'
else
    echo "JSDoc Line-Length Guard — ${PHASE_LABEL}"
    echo "==============================================="
    echo "Scope:                ${SCOPE_LABEL}"
    echo "Max chars (NFR-1):    ${MAX_CHARS}"
    echo "Violations found:     ${VIOLATION_COUNT}"
    echo ""
    if [ "${VIOLATION_COUNT}" = "0" ]; then
        echo "PASS: All JSDoc comment lines in ${SCOPE_LABEL} are within ${MAX_CHARS} chars."
    else
        echo "FAIL: ${VIOLATION_COUNT} JSDoc comment line(s) exceed ${MAX_CHARS} chars."
        echo ""
        echo "Format: <file>:<line>:<length>"
        while IFS= read -r v; do
            [ -z "${v}" ] && continue
            echo "  ${v#${REPO_ROOT}/}"
        done < "${VIOLATIONS_FILE}"
        echo ""
        echo "Per spec.md NFR-1, JSDoc comments must not exceed ${MAX_CHARS} chars per line."
        echo "Fix by wrapping long @param / @returns / @throws descriptions across multiple lines."
    fi
fi

if [ "${VIOLATION_COUNT}" = "0" ]; then
    exit 0
fi
exit 1
