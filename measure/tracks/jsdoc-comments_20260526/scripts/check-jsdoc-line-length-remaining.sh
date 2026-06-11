#!/usr/bin/env bash
# Phase 3 JSDoc Line-Length Guard — Red baseline supplement for jsdoc-comments_20260526.
#
# Enforces NFR-1 (spec.md §Non-Functional Requirements): "JSDoc comments must not exceed
# 120 chars per line." Existing ESLint config does NOT enforce line length on comments
# (test-strategy.md §3), so this shell guard is the per-phase check the strategy calls for.
#
# Sibling to check-jsdoc-line-length.sh (Phase 1 BM2 lib/) and
# check-jsdoc-line-length-components.sh (Phase 2 BM2 components/). Same regex shape, different
# scope — kept as a separate file so the per-phase acceptance gate stays a single command.
#
# Phase 1 added this guard as a Task 1.4 supplement AFTER Tasks 1.1–1.3 were Green, and
# four long-`@param` lines slipped past. For Phase 3 the guard is included from the start
# as a regression net — current Red baseline is captured at 0 violations in scope, and
# Green acceptance requires it to remain at 0 after Tasks 3.1 + 3.2 add JSDoc to the 185
# undocumented functions.
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
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-remaining.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-remaining.sh --json
#
# Configuration (env overrides):
#   MAX_CHARS  : line-length cap (default 120, per NFR-1)
#   SCOPE_DIR  : root directory to scan (default apps/bus-math-v2)
#                 — scans every .ts / .tsx file under SCOPE_DIR
#
# Scope note: the guard scans only the Phase 3 subdirectories (`app/`, `convex/`,
# `scripts/`, `hooks/`, `cloudflare/`) plus the top-level BM2 files `middleware.ts` and
# `vite.config.ts`. It deliberately excludes `node_modules/`, `convex/_generated/`, `.next/`,
# `.wrangler/`, `dist/`, `__tests__/`, and `.d.ts` files (declaration files contain
# auto-generated JSDoc from upstream packages and are not application source). Phase 1
# (`lib/`) and Phase 2 (`components/`) are already Green at 0 violations; this guard is
# a regression net for Phase 3's JSDoc additions.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
MAX_CHARS="${MAX_CHARS:-120}"
PHASE_LABEL="Phase 3 (BM2 app/convex/scripts/other)"

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

# Build the per-file list. Use find to enumerate only .ts / .tsx files inside the Phase 3
# subdirs, then collect top-level middleware.ts and vite.config.ts via -name patterns.
# Skip node_modules / .next / .wrangler / dist / .convex / _generated / .d.ts noise.
{
    find "${REPO_ROOT}/apps/bus-math-v2/app" \
         "${REPO_ROOT}/apps/bus-math-v2/convex" \
         "${REPO_ROOT}/apps/bus-math-v2/scripts" \
         "${REPO_ROOT}/apps/bus-math-v2/hooks" \
         "${REPO_ROOT}/apps/bus-math-v2/cloudflare" \
         -type f \( -name '*.ts' -o -name '*.tsx' \) \
         -not -path '*/node_modules/*' \
         -not -path '*/.next/*' \
         -not -path '*/.wrangler/*' \
         -not -path '*/dist/*' \
         -not -path '*/.convex/*' \
         -not -path '*/_generated/*' \
         -not -name '*.d.ts' 2>/dev/null
    printf '%s\n' "${REPO_ROOT}/apps/bus-math-v2/middleware.ts"
    printf '%s\n' "${REPO_ROOT}/apps/bus-math-v2/vite.config.ts"
} | sort -u | grep -v '^$' > "${VIOLATIONS_FILE}.files"

# Pass the file list to awk via xargs. FNR is awk's per-file line number; NR is cumulative
# across files (xargs may invoke awk once with multiple files), so FNR is mandatory for
# accurate reporting.
xargs -a "${VIOLATIONS_FILE}.files" awk -v max="${MAX_CHARS}" '
    /^[[:space:]]*\/\*\*/ || /^[[:space:]]*\*/ || /^[[:space:]]*\*\// {
        if (length($0) > max) {
            printf "%s:%d:%d\n", FILENAME, FNR, length($0)
        }
    }
' > "${VIOLATIONS_FILE}" 2>/dev/null || true

VIOLATION_COUNT=$(wc -l < "${VIOLATIONS_FILE}" | tr -d ' ')
SCOPE_LABEL="apps/bus-math-v2/{app,convex,scripts,hooks,cloudflare,middleware.ts,vite.config.ts}"

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
