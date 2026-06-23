#!/usr/bin/env bash
# Phase 9 JSDoc Line-Length Guard — Red baseline supplement for jsdoc-comments_20260526.
#
# Enforces NFR-1 (spec.md §Non-Functional Requirements): "JSDoc comments must not exceed
# 120 chars per line." Sibling of check-jsdoc-line-length-packages-src.sh (Phase 8).
#
# Phase 9 scope: packages/*/src/components/, packages/*/src/lib/, and other subdirectories
# (hooks/, utils/, types/). Excludes __tests__/ and node_modules/.
#
# Exit codes:
#   0 = pass (zero JSDoc lines > MAX_CHARS in scope)
#   1 = fail (one or more JSDoc continuation lines exceed MAX_CHARS)
#   3 = misuse (missing dependency / unreadable scope)
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-packages-remaining.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-packages-remaining.sh --json

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
MAX_CHARS="${MAX_CHARS:-120}"
PHASE_LABEL="Phase 9 (Packages components/lib/other)"

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

# Find all .ts/.tsx files in Phase 9 scope subdirectories
find "${REPO_ROOT}/packages" -type f \( -name '*.ts' -o -name '*.tsx' \) \
    -path "*/src/components/*" -o -path "*/src/lib/*" -o -path "*/src/hooks/*" \
    -o -path "*/src/utils/*" -o -path "*/src/types/*" 2>/dev/null \
    | grep -v '/node_modules/' \
    | grep -v '/.next/' \
    | grep -v '/dist/' \
    | grep -v '/__tests__/' \
    | grep -v '\.d\.ts$' \
    | sort -u > "${VIOLATIONS_FILE}.files"

xargs -a "${VIOLATIONS_FILE}.files" awk -v max="${MAX_CHARS}" '
    /^[[:space:]]*\/\*\*/ || /^[[:space:]]*\*/ || /^[[:space:]]*\*\// {
        if (length($0) > max) {
            printf "%s:%d:%d\n", FILENAME, FNR, length($0)
        }
    }
' > "${VIOLATIONS_FILE}" 2>/dev/null || true

VIOLATION_COUNT=$(wc -l < "${VIOLATIONS_FILE}" | tr -d ' ')
SCOPE_LABEL="packages/*/src/{components,lib,hooks,utils,types}"

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
    fi
fi

if [ "${VIOLATION_COUNT}" = "0" ]; then
    exit 0
fi
exit 1
