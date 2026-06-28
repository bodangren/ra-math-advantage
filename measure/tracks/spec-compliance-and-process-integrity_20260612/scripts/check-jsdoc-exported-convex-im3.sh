#!/usr/bin/env bash
# Phase 4 Exported-Convex-Surface Guard — Red contract test for spec-compliance-and-process-integrity_20260612.
#
# Per measure/tracks/spec-compliance-and-process-integrity_20260612/test-strategy.md §1 and §9,
# this script is the "Tip: 1 new shell guard (Convex exported-surface)" tier. Artifact-only, no unit.
#
# Asserts: every exported Convex wrapper declaration in the target scope has a
# JSDoc block (closing `*/`) on the line immediately above the declaration.
# The JSDoc must be on the wrapper line itself (the `export const X = ...` line),
# NOT on the internal `*Handler` function (per spec §F / §E — the old Phase 4
# JSDoc was placed on `*Handler` functions, not on the actual exported wrappers).
#
# Detection scope (default): apps/integrated-math-3/convex/** (excluding _generated/,
# *.d.ts, node_modules/, dist/, .next/, .wrangler/, crons.ts).
# Override (space-separated): SCOPE_DIRS="/path/one /path/two"
#
# Detected declaration shapes (per-line prefix regex):
#   - `export const <name> = internalQuery(`
#   - `export const <name> = internalMutation(`
#   - `export const <name> = internalAction(`
#   - `export const <name> = action(`
#   - `export const <name> = query(`
#   - `export const <name> = mutation(`
#   - `export const <name> = cron(`
#
# NOT detected (intentionally out of scope):
#   - Re-exports: `export { name }` — JSDoc lives on the source declaration.
#   - Internal `*Handler` functions, internal `async function`s — those are
#     covered by Task 4.1/4.2 (audit @throws / @returns on the handler), not
#     by Task 4.4.
#   - `crons.ts` — uses `cronJobs()` + `export default crons`, not per-symbol
#     wrapper lines. Properly excluded.
#
# JSDoc rule: the line immediately above the wrapper line must end with `*/`
# (either a single-line `/** ... */` or the closing of a multi-line block).
# Same rule the archived check-jsdoc-exported-im3-app.sh enforced for IM3 app/ exports.
#
# Lives under measure/tracks/<track>/scripts/ (Measure-owned test artifact, not
# app source) to honor the Red-phase boundary: tests + Measure docs only,
# no application code paths modified.
#
# Exit codes:
#   0 = pass (all exported wrappers have preceding JSDoc)
#   1 = fail (one or more wrappers lack preceding JSDoc)
#   3 = misuse (missing grep/find, scope path not found, no files in scope)
#
# Usage:
#   bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-exported-convex-im3.sh
#   bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-exported-convex-im3.sh --json
#   SCOPE_DIRS="/path/to/dir" bash .../check-jsdoc-exported-convex-im3.sh
#   SCOPE_DIRS=".../fixtures/exported-convex-bad-sample.ts" bash .../check-jsdoc-exported-convex-im3.sh

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SCRIPTS_DIR="${REPO_ROOT}/measure/tracks/spec-compliance-and-process-integrity_20260612/scripts"
DEFAULT_FIXTURE="${SCRIPTS_DIR}/fixtures/exported-convex-bad-sample.ts"
IM3_CONVEX="${REPO_ROOT}/apps/integrated-math-3/convex"
PHASE_LABEL="Phase 4 (Convex exported-surface)"
SCOPE_LABEL_DEFAULT="apps/integrated-math-3/convex/"

# SCOPE_DIRS env override. Space-separated list of paths (files or directories).
SCOPE_DIRS="${SCOPE_DIRS:-${IM3_CONVEX}}"

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

if ! command -v grep >/dev/null 2>&1; then
    echo "ERROR: grep not on PATH" >&2
    exit 3
fi
if ! command -v find >/dev/null 2>&1; then
    echo "ERROR: find not on PATH" >&2
    exit 3
fi

# Resolve the scope list to absolute paths.
declare -a RESOLVED_PATHS=()
for raw in ${SCOPE_DIRS}; do
    if [ "${raw#/}" = "${raw}" ]; then
        abs="${REPO_ROOT}/${raw}"
    else
        abs="${raw}"
    fi
    if [ ! -e "${abs}" ]; then
        echo "ERROR: scope path not found: ${abs}" >&2
        exit 3
    fi
    RESOLVED_PATHS+=("${abs}")
done

# Collect the set of .ts / .tsx files in scope. Exclude Convex _generated/,
# declaration files, crons.ts (uses cronJobs() aggregator, not per-symbol wrappers),
# and standard build/dependency noise.
declare -a SCOPE_FILES=()
for path in "${RESOLVED_PATHS[@]}"; do
    if [ -f "${path}" ]; then
        # Single-file scope (used by the runner-plumbing fixture self-test).
        case "${path}" in
            *.ts|*.tsx) SCOPE_FILES+=("${path}") ;;
            *) ;; # ignore non-ts files passed in single-file mode
        esac
    elif [ -d "${path}" ]; then
        while IFS= read -r -d '' f; do
            SCOPE_FILES+=("${f}")
        done < <(find "${path}" -type f \( -name '*.ts' -o -name '*.tsx' \) \
            -not -path '*/node_modules/*' \
            -not -path '*/.next/*' \
            -not -path '*/.wrangler/*' \
            -not -path '*/dist/*' \
            -not -path '*/_generated/*' \
            -not -name '*.d.ts' \
            -not -name 'crons.ts' \
            -print0)
    fi
done

if [ "${#SCOPE_FILES[@]}" -eq 0 ]; then
    echo "ERROR: no .ts/.tsx files found in scope (SCOPE_DIRS='${SCOPE_DIRS}')" >&2
    exit 3
fi

# Wrapper-line regex: matches any of the 7 Convex wrapper patterns.
# Anchored at line start with optional leading whitespace.
WRAPPER_RE='^[[:space:]]*export[[:space:]]+const[[:space:]]+[A-Za-z_][A-Za-z0-9_]*[[:space:]]*=[[:space:]]*(internalQuery|internalMutation|internalAction|query|mutation|action|cron)\('

# Per-file accumulator. Files with at least one missing-JSDoc are listed in fail output.
declare -A FILE_MISSING
declare -A FILE_DECLARATIONS
MISSING_TOTAL=0
SCANNED_FILES=0
DECL_TOTAL=0

scan_file() {
    local file="$1"
    [ -f "${file}" ] || return 0
    local rel="${file#${REPO_ROOT}/}"
    local file_missing=0
    local decl_count=0
    # Track whether the line immediately above the current line was a JSDoc close (`*/`).
    local prev_close=0
    local in_block=0
    local line_no=0
    while IFS= read -r line; do
        line_no=$((line_no + 1))
        # Track JSDoc block state.
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
            # Continuation of a JSDoc block or single-line comment — only
            # the outer-block continuation keeps prev_close=0.
            if [ "${in_block}" = "1" ]; then
                prev_close=0
            fi
            continue
        fi
        # Non-comment line. Test for exported wrapper declaration.
        if [[ "${line}" =~ ${WRAPPER_RE} ]]; then
            decl_count=$((decl_count + 1))
            DECL_TOTAL=$((DECL_TOTAL + 1))
            if [ "${prev_close}" != "1" ]; then
                file_missing=$((file_missing + 1))
                MISSING_TOTAL=$((MISSING_TOTAL + 1))
            fi
        fi
        # Reset prev_close: only a JSDoc close `*/` sets it.
        prev_close=0
    done < "${file}"
    SCANNED_FILES=$((SCANNED_FILES + 1))
    if [ "${file_missing}" -gt 0 ]; then
        FILE_MISSING["${rel}"]="${file_missing}"
    fi
    if [ "${decl_count}" -gt 0 ]; then
        FILE_DECLARATIONS["${rel}"]="${decl_count}"
    fi
}

for entry in "${SCOPE_DIRS[@]}"; do
    if [ -f "${entry}" ]; then
        scan_file "${entry}"
    elif [ -d "${entry}" ]; then
        for f in "${SCOPE_FILES[@]}"; do
            scan_file "${f}"
        done
    fi
done

# Build the human-readable scope label (relative to repo root).
SCOPE_LABEL=""
for raw in ${SCOPE_DIRS}; do
    if [ -n "${SCOPE_LABEL}" ]; then
        SCOPE_LABEL+=" "
    fi
    if [ "${raw#/}" = "${raw}" ]; then
        SCOPE_LABEL+="${raw}"
    else
        SCOPE_LABEL+="${raw#${REPO_ROOT}/}"
    fi
done

# JSON output: stable shape, single line, machine-parseable.
if [ "${JSON_MODE}" = "1" ]; then
    files_json="["
    first=1
    for k in "${!FILE_MISSING[@]}"; do
        if [ "${first}" = "1" ]; then first=0; else files_json+=","; fi
        esc_k=$(printf '%s' "${k}" | sed 's/"/\\"/g')
        files_json+="{\"file\":\"${esc_k}\",\"missing\":${FILE_MISSING[${k}]}}"
    done
    files_json+="]"
    printf '{"phase":"%s","scope":"%s","scanned_files":%d,"declarations":%d,"missing_jsdoc":%d,"pass":%s,"files_missing":%s}\n' \
        "${PHASE_LABEL}" "${SCOPE_LABEL}" "${SCANNED_FILES}" "${DECL_TOTAL}" "${MISSING_TOTAL}" \
        "$([ "${MISSING_TOTAL}" = "0" ] && echo true || echo false)" \
        "${files_json}"
else
    echo "Exported-Convex-Surface Guard — ${PHASE_LABEL}"
    echo "================================================="
    echo "Scope:                          ${SCOPE_LABEL}"
    echo "Scanned files:                  ${SCANNED_FILES}"
    echo "Exported wrapper declarations:  ${DECL_TOTAL}"
    echo "Missing JSDoc (count):          ${MISSING_TOTAL}"
    echo ""
fi

if [ "${MISSING_TOTAL}" = "0" ]; then
    [ "${JSON_MODE}" = "0" ] && echo "PASS: All ${DECL_TOTAL} exported Convex wrapper declarations in ${SCOPE_LABEL} have a preceding JSDoc block."
    exit 0
fi

if [ "${JSON_MODE}" = "0" ]; then
    echo "FAIL: ${MISSING_TOTAL} exported Convex wrapper declaration(s) in ${SCOPE_LABEL} lack a JSDoc block."
    echo ""
    echo "Per spec.md §E (Convex Exported Surface Undocumented) and FR-5: every exported"
    echo "Convex wrapper (export const X = internalQuery(...) / internalMutation(...) / etc.)"
    echo "must have a JSDoc block (closing */) on the line immediately above the declaration."
    echo ""
    echo "Per-file breakdown (source-level regex scan):"
    for k in "${!FILE_MISSING[@]}"; do
        echo "  ${k}: ${FILE_MISSING[${k}]} missing (of ${FILE_DECLARATIONS[${k}]:-?} declarations)"
    done
    echo ""
    echo "Runner-plumbing self-test (closeout gate per test-strategy §9 P4):"
    echo "  SCOPE_DIRS=${DEFAULT_FIXTURE#${REPO_ROOT}/} bash \\"
    echo "    measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-exported-convex-im3.sh"
    echo "  Expected: missing_jsdoc=2, declarations=4, exit 1."
fi
exit 1
