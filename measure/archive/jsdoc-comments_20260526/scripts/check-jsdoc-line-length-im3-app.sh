#!/usr/bin/env bash
# Phase 7 JSDoc Line-Length Guard — Red baseline supplement for jsdoc-comments_20260526.
#
# Enforces NFR-1 (spec.md §Non-Functional Requirements): "JSDoc comments must not exceed
# 120 chars per line." Existing ESLint config does NOT enforce line length on comments
# (test-strategy.md §3), so this shell guard is the per-phase check the strategy calls for.
#
# Sibling to check-jsdoc-line-length.sh (Phase 1 BM2 lib/),
# check-jsdoc-line-length-components.sh (Phase 2 BM2 components/),
# check-jsdoc-line-length-remaining.sh (Phase 3 BM2 app/convex/scripts/other),
# check-jsdoc-line-length-convex-im3.sh (Phase 4 IM3 convex/),
# check-jsdoc-line-length-components-im3.sh (Phase 5 IM3 components/), and
# check-jsdoc-line-length-im3-lib.sh (Phase 6 IM3 lib/). Same regex shape, different
# scope — kept as a separate file so the per-phase acceptance gate stays a single command
# and so the JSON output reports the right phase label.
#
# Phase 1 added this guard as a Task 1.4 supplement AFTER Tasks 1.1–1.3 were Green, and
# four long-`@param` lines slipped past Phase 1. From Phase 2 onward the guard is included
# from the start as a regression net — current Phase 7 Red baseline is 0 violations in
# scope, and Green acceptance requires it to remain at 0 after Tasks 7.1 + 7.2 add JSDoc
# to the 87 undocumented functions in IM3 app/scripts/other.
#
# Per test-strategy.md §3, Phase 7 includes Next.js App Router pages (JSX components with
# default-export `function Foo()` patterns), Node scripts (long internal helper chains in
# `generate-curriculum-remediation-artifacts.ts`), and Playwright E2E specs (test helpers).
# Common pitfall: JSDoc on a default-exported page component can grow long when the page
# route URL + auth context + render-side-effects are all summarized in the same `/** … */`
# block. Another pitfall: `generate-curriculum-remediation-artifacts.ts` has 18 internal
# helpers in a single file, several of which take 3-4 string parameters with format
# examples — the @param lines can easily exceed 120 chars if the format string is inlined.
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
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-im3-app.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-im3-app.sh --json
#
# Configuration (env overrides):
#   MAX_CHARS  : line-length cap (default 120, per NFR-1)
#   SCOPE_DIRS : space-separated list of root dirs to scan (default: app + scripts + middleware + cloudflare + e2e + vite.config under apps/integrated-math-3)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
MAX_CHARS="${MAX_CHARS:-120}"
IM3="${REPO_ROOT}/apps/integrated-math-3"
# Default scope mirrors the coverage guard's LIKE patterns. SCOPE_DIRS is a space-separated
# list passed to find - the middleware.ts and vite.config.ts are single files, the rest are
# directories. We scan them all with a single find call.
DEFAULT_DIRS="${IM3}/app ${IM3}/scripts ${IM3}/middleware.ts ${IM3}/cloudflare ${IM3}/e2e ${IM3}/vite.config.ts"
# shellcheck disable=SC2206
SCOPE_DIRS=( ${SCOPE_DIRS:-${DEFAULT_DIRS}} )
SCOPE_LABEL="apps/integrated-math-3/{app,scripts,middleware,cloudflare,e2e,vite.config}"
PHASE_LABEL="Phase 7 (IM3 app/scripts/other)"

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

if ! command -v awk >/dev/null 2>&1; then
    echo "ERROR: awk not on PATH" >&2
    exit 3
fi

VIOLATIONS_FILE="$(mktemp)"
trap 'rm -f "${VIOLATIONS_FILE}"' EXIT

# Scan every .ts / .tsx file in scope. Skip node_modules / .next / .wrangler / dist noise.
# No _generated/ or *.d.ts exclusions needed for Phase 7 (no Convex codegen here;
# next-env.d.ts is excluded by the *.ts name filter since we only match .ts / .tsx, but
# in practice find by name *.ts still hits *.d.ts — handle that explicitly).
find "${SCOPE_DIRS[@]}" -type f \( -name '*.ts' -o -name '*.tsx' \) \
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
