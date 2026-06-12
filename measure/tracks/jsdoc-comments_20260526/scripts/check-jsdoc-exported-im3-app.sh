#!/usr/bin/env bash
# Phase 7 Exported-JSDoc Source Guard — Red contract test for jsdoc-comments_20260526.
#
# Per measure/tracks/jsdoc-comments_20260526/test-strategy.md §1, this script is the
# "Static guards (largest)" tier — a shell guard, NOT a vitest file (the strategy
# explicitly bans new vitest files for doc text).
#
# This guard is the **pre-parse companion** to `check-jsdoc-coverage-im3-app.sh`:
# the coverage guard queries the parsed `graph.db` (post-AST), while THIS guard
# scans the source files directly with regex to detect exported function
# declarations that lack a JSDoc block on the line(s) immediately above them.
# The two guards are independent: this one doesn't read graph.db, the coverage
# one doesn't read source. Cross-validation: both should report the same exported
# function count and the same NULL count.
#
# Why both guards:
# - graph.db is build-artifact state that can drift from source if the rescan
#   cadence slips (test-strategy.md §3 "Phase dependency: build-graph scan after
#   each phase is shared mutable state").
# - The coverage guard depends on `build-graph scan` having been run after every
#   source change. A missed rescan would let new undocumented functions slip past.
# - This source-level guard is O(grep) and runs in <1s — useful as a cheap cross-
#   check that doesn't need graph.db to be fresh.
#
# Asserts: every exported function declaration in IM3 `app/`, `scripts/`, and
# "other" (middleware.ts, cloudflare/, e2e/, vite.config.ts) has a JSDoc block
# (closing `*/`) on the line immediately above the declaration. JSDoc on
# arrow-function `const` lines is also detected (test-strategy.md §3 pitfall).
# Exit 0 = pass. Non-zero = fail.
#
# Lives under measure/tracks/<track>/scripts/ (Measure-owned test artifact, not
# an app script) to honor the Red-phase boundary: tests and Measure docs only,
# no application source paths modified.
#
# Sibling of check-jsdoc-coverage-im3-app.sh (Phase 7), check-jsdoc-line-length-
# im3-app.sh (Phase 7), check-phase-verification-7.sh (Phase 7), and the generic
# check-jsdoc-fr6-noncomment-diff.sh (Phase 2 — accepts FR6_SCOPE env override).
# This is the Phase 7-specific **5th Red-contract guard** that closes the
# source/parse cross-validation gap and provides a graph-independent pre-parse
# check for JSDoc-on-exported-function completeness.
#
# Detection scope (matches the Phase 7 coverage guard's file_path LIKE patterns):
#   - apps/integrated-math-3/app/**
#   - apps/integrated-math-3/scripts/**
#   - apps/integrated-math-3/middleware.ts
#   - apps/integrated-math-3/cloudflare/**
#   - apps/integrated-math-3/e2e/**
#   - apps/integrated-math-3/vite.config.ts
#
# Detected declaration shapes (matching exported function patterns only):
#   - `export function name(...)`              (named function export)
#   - `export async function name(...)`        (async named function export)
#   - `export default function name(...)`      (default-exported function)
#   - `export default async function name(...)`(default-exported async function)
#   - `export const name = (`                  (arrow-function export; JSDoc on the const line)
#   - `export const name = async (`            (async arrow-function export)
#
# NOT detected (intentional, out of scope for Phase 7 "exported" task):
#   - Plain `function name(...)` / `async function name(...)` (internal — covered by Task 7.2)
#   - `const name = (` (not exported — internal)
#   - Re-exports `export { name }` (test-strategy.md §3: JSDoc on the source, not the barrel)
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-exported-im3-app.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-exported-im3-app.sh --json
#
# Requires: bash 4+ (associative arrays), grep, awk on PATH. No build-graph or
# graph.db required.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
IM3="${REPO_ROOT}/apps/integrated-math-3"
SCOPE_LABEL="apps/integrated-math-3/{app,scripts,middleware,cloudflare,e2e,vite.config}"
PHASE_LABEL="Phase 7 (IM3 app/scripts/other)"

# Directories + files to scan. SCOPE_DIRS env override supported.
DEFAULT_DIRS=("${IM3}/app" "${IM3}/scripts" "${IM3}/cloudflare" "${IM3}/e2e")
# shellcheck disable=SC2206
SCOPE_DIRS=( ${SCOPE_DIRS:-${DEFAULT_DIRS[@]}} )

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

if ! command -v grep >/dev/null 2>&1; then
    echo "ERROR: grep not on PATH" >&2
    exit 3
fi

# Per-file accumulator. Files with at least one missing-JSDoc are listed in fail output.
declare -A FILE_MISSING
MISSING_TOTAL=0
SCANNED_FILES=0
DECL_TOTAL=0

scan_file() {
    local file="$1"
    [ -f "${file}" ] || return 0
    local rel="${file#${REPO_ROOT}/}"
    local file_missing=0
    local decl_count=0
    # Read file line-by-line; track whether the PREVIOUS line was a JSDoc close (`*/`).
    # A declaration counts as documented iff the line immediately above (or a few
    # lines above for a multi-line JSDoc block) ends in `*/`. We use a simpler
    # rule: the line directly above the declaration must match `*space**/` OR
    # the declaration must be inside a JSDoc block (we track the most recent
    # `/**` opener and `*/` closer on a sliding window).
    local prev_close=0
    local in_block=0
    local line_no=0
    while IFS= read -r line; do
        line_no=$((line_no + 1))
        # Skip pure comment-only lines, but track block state.
        if [[ "${line}" =~ ^[[:space:]]*/\*\* ]]; then
            in_block=1
            prev_close=0
            continue
        fi
        if [[ "${line}" =~ ^[[:space:]]*\*/ ]]; then
            in_block=0
            prev_close=1
            continue
        fi
        if [[ "${line}" =~ ^[[:space:]]*\* ]] || [[ "${line}" =~ ^[[:space:]]*// ]]; then
            # Continuation of an outer JSDoc block or a single-line `//` — only
            # the outer-block continuation keeps prev_close=0 (we don't reset
            # prev_close here because the next non-comment line should still see
            # the prior `*/` from the same block).
            if [ "${in_block}" = "1" ]; then
                prev_close=0
            fi
            continue
        fi
        # Non-comment line. Test for exported function declaration.
        # Pattern set: see header docstring.
        local is_decl=0
        if [[ "${line}" =~ ^[[:space:]]*export[[:space:]]+(default[[:space:]]+)?(async[[:space:]]+)?function[[:space:]]+[A-Za-z_][A-Za-z0-9_]*[[:space:]]*\( ]]; then
            is_decl=1
        elif [[ "${line}" =~ ^[[:space:]]*export[[:space:]]+const[[:space:]]+[A-Za-z_][A-Za-z0-9_]*[[:space:]]*=?[[:space:]]*(async[[:space:]]*)?\( ]]; then
            is_decl=1
        fi
        if [ "${is_decl}" = "1" ]; then
            decl_count=$((decl_count + 1))
            DECL_TOTAL=$((DECL_TOTAL + 1))
            if [ "${prev_close}" != "1" ]; then
                file_missing=$((file_missing + 1))
                MISSING_TOTAL=$((MISSING_TOTAL + 1))
            fi
        fi
        # Reset prev_close: only a JSDoc close `*/` sets it. The next non-comment
        # line (the declaration) consumes it; the line after that resets to 0.
        prev_close=0
    done < "${file}"
    SCANNED_FILES=$((SCANNED_FILES + 1))
    if [ "${file_missing}" -gt 0 ]; then
        FILE_MISSING["${rel}"]="${file_missing}"
    fi
    # Avoid unused-variable warning on decl_count (kept for future per-file output)
    : "${decl_count}"
}

# Scan each .ts / .tsx file in the SCOPE_DIRS. Single file paths (middleware.ts,
# vite.config.ts) are handled by passing the file path directly to scan_file.
for entry in "${SCOPE_DIRS[@]}"; do
    if [ -f "${entry}" ]; then
        scan_file "${entry}"
    elif [ -d "${entry}" ]; then
        while IFS= read -r -d '' f; do
            scan_file "${f}"
        done < <(find "${entry}" -type f \( -name '*.ts' -o -name '*.tsx' \) \
            -not -path '*/node_modules/*' \
            -not -path '*/.next/*' \
            -not -path '*/.wrangler/*' \
            -not -path '*/dist/*' \
            -not -name '*.d.ts' \
            -print0)
    fi
done

# Also scan the two single-file Phase 7 entries (middleware.ts, vite.config.ts)
# when SCOPE_DIRS is the default — they may not be in the default list.
scan_file "${IM3}/middleware.ts"
scan_file "${IM3}/vite.config.ts"

if [ "${JSON_MODE}" = "1" ]; then
    printf '{"phase":"%s","scope":"%s","scanned_files":%d,"exported_declarations":%d,"missing_jsdoc":%d,"pass":%s,"files_missing":[' \
        "${PHASE_LABEL}" "${SCOPE_LABEL}" "${SCANNED_FILES}" "${DECL_TOTAL}" "${MISSING_TOTAL}" \
        "$([ "${MISSING_TOTAL}" = "0" ] && echo true || echo false)"
    first=1
    for k in "${!FILE_MISSING[@]}"; do
        if [ "${first}" = "1" ]; then first=0; else printf ','; fi
        esc_k=$(printf '%s' "${k}" | sed 's/"/\\"/g')
        printf '{"file":"%s","missing":%d}' "${esc_k}" "${FILE_MISSING[${k}]}"
    done
    printf ']}\n'
else
    echo "Exported-JSDoc Source Guard — ${PHASE_LABEL}"
    echo "================================================="
    echo "Scope:                          ${SCOPE_LABEL}"
    echo "Scanned files:                  ${SCANNED_FILES}"
    echo "Exported function declarations: ${DECL_TOTAL}"
    echo "Missing JSDoc (count):          ${MISSING_TOTAL}"
    echo ""
fi

if [ "${MISSING_TOTAL}" = "0" ]; then
    [ "${JSON_MODE}" = "0" ] && echo "PASS: All ${DECL_TOTAL} exported function declarations in ${SCOPE_LABEL} have a JSDoc block."
    exit 0
fi

if [ "${JSON_MODE}" = "0" ]; then
    echo "FAIL: ${MISSING_TOTAL} exported function declaration(s) in ${SCOPE_LABEL} lack a JSDoc block."
    echo ""
    echo "Per measure/tracks/jsdoc-comments_20260526/spec.md FR-1, every exported function"
    echo "must have a JSDoc block (summary, @param, @returns) directly above the declaration."
    echo ""
    echo "Per-file breakdown (source-level regex scan):"
    for k in "${!FILE_MISSING[@]}"; do
        echo "  ${k}: ${FILE_MISSING[${k}]} missing"
    done
    echo ""
    echo "Cross-check: this guard should report the same exported-NULL count as the"
    echo "graph-based coverage guard:"
    echo "  bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-app.sh"
    echo ""
    echo "Reproduce: this guard runs grep/awk on source files (no graph.db dependency)."
fi
exit 1
