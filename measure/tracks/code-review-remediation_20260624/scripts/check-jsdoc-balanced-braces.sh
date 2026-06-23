#!/usr/bin/env bash
# FR-3 Balanced-Brace JSDoc Guard — Red contract for code-review-remediation_20260624 Phase 1.
#
# Per test-strategy.md §3 Task 1.1: enforces that every @param and @returns JSDoc tag
# in the target scope has balanced {/} braces inside the type annotation, and no stray
# empty `{}` block after the first balanced type.
#
# Detection rules (syntactic invariant):
#   1. For each @param/@returns tag with a {type} annotation, count { and } from the
#      first { until the brace depth returns to 0. This is the "type region".
#   2. If the brace depth never returns to 0 on the same line, the tag is malformed
#      (unbalanced — e.g. `@returns {string {} desc`).
#   3. If the type region is balanced but is immediately followed by another `{` that
#      starts a new brace block (depth goes back up from 0), the tag is malformed
#      (stray block — e.g. `@returns {JSX.Element} {Promise<...> {}`).
#   4. Tags with no {type} annotation (prose-only) are NOT flagged.
#   5. Nested generics like `Promise<Map<string, T>>` are correctly handled because
#      the depth counter tracks every `{` and `}`.
#
# Modelled on: measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
#
# Exit codes:
#   0 = pass (zero violations in scope)
#   1 = fail (one or more violations — count printed)
#   3 = misuse (missing grep/xargs, scope path not found, no files in scope)
#
# Usage:
#   bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh
#   bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh /path/to/file.ts
#   BALANCED_BRACES_SCOPE="apps/ packages/ convex/" bash .../check-jsdoc-balanced-braces.sh
#
# Fixture self-test (runner-plumbing, NOT a production gate):
#   bash .../check-jsdoc-balanced-braces.sh \
#     measure/tracks/code-review-remediation_20260624/scripts/fixtures/malformed-1.ts
#   Expected: violations=1, exit 1.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SCRIPTS_DIR="${REPO_ROOT}/measure/tracks/code-review-remediation_20260624/scripts"
FIXTURES_DIR="${SCRIPTS_DIR}/fixtures"
DEFAULT_SCOPE="apps/ packages/ convex/"
PHASE_LABEL="Phase 1 (FR-3 balanced-brace)"

# Scope: space-separated list of paths (files or directories). Resolved relative to REPO_ROOT.
BALANCED_BRACES_SCOPE="${BALANCED_BRACES_SCOPE:-${DEFAULT_SCOPE}}"
# If a positional argument is given, use it as the scope (single file or dir).
if [ -n "${1:-}" ]; then
    BALANCED_BRACES_SCOPE="$1"
fi
BALANCED_BRACES_LIMIT="${BALANCED_BRACES_LIMIT:-25}"

if ! command -v awk >/dev/null 2>&1; then
    echo "ERROR: awk not on PATH" >&2
    exit 3
fi

# --- Resolve scope paths ---
declare -a RESOLVED_PATHS=()
for raw in ${BALANCED_BRACES_SCOPE}; do
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

# --- Collect .ts/.tsx files in scope (exclude noise directories) ---
declare -a SCOPE_FILES=()
for path in "${RESOLVED_PATHS[@]}"; do
    if [ -f "${path}" ]; then
        case "${path}" in
            *.ts|*.tsx) SCOPE_FILES+=("${path}") ;;
            *) ;;
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
            -print0)
    fi
done

if [ "${#SCOPE_FILES[@]}" -eq 0 ]; then
    echo "ERROR: no .ts/.tsx files found in scope (BALANCED_BRACES_SCOPE='${BALANCED_BRACES_SCOPE}')" >&2
    exit 3
fi

SCANNED_FILES=${#SCOPE_FILES[@]}

# --- Run the awk-based scanner ---
# awk processes each file, extracts @param/@returns lines, parses brace/paren balance.
# Output format: violations on stdout, summary as last line with SUMMARY prefix.

AWK_OUTPUT=$(awk '
BEGIN {
    total_tags = 0
    violations = 0
    file_count = 0
}

# Process each file from the file list
FNR == 1 {
    if (FILENAME != prev_file) {
        prev_file = FILENAME
        file_count++
    }
}

# Match JSDoc @param or @returns lines
/^[[:space:]]*(\*|\/\*\*)[[:space:]]*@(param|returns)([[:space:]]|$)/ {
    # Extract the type region: strip leading JSDoc prefix and @param/@returns keyword
    line = $0
    # Remove leading whitespace and JSDoc marker (* or /**)
    sub(/^[[:space:]]*(\*|\/\*\*)[[:space:]]*/, "", line)
    # Remove @param or @returns keyword
    sub(/@(param|returns)[[:space:]]*/, "", line)
    
    # Must start with { to have a type annotation
    if (substr(line, 1, 1) != "{") next
    
    total_tags++
    
    # Parse brace depth to find where the first balanced type ends
    depth = 0
    type_end = -1
    len = length(line)
    for (i = 1; i <= len; i++) {
        ch = substr(line, i, 1)
        if (ch == "{") depth++
        else if (ch == "}") {
            depth--
            if (depth == 0) {
                type_end = i
                break
            }
        }
    }
    
    # Rule 2: depth never returned to 0 — unbalanced braces
    if (type_end == -1) {
        violations++
        print FILENAME "\tUNBALANCED\t" $0
        next
    }
    
    # Rule 2b: braces balanced but parentheses unbalanced inside the type region.
    # Catches truncated function types like {(a: string, b: number}
    paren_depth = 0
    for (j = 1; j <= type_end; j++) {
        ch = substr(line, j, 1)
        if (ch == "(") paren_depth++
        else if (ch == ")") paren_depth--
    }
    if (paren_depth != 0) {
        violations++
        print FILENAME "\tUNBALANCED_PARENS\t" $0
        next
    }
    
    # Rule 3: check for any stray { after the first balanced type block.
    # After the type region ends, any subsequent { on the same line is a violation.
    # This scans the ENTIRE rest of the line, not just the first non-space
    # character — catches embedded ` {} ` inside descriptive prose
    # (e.g. `@returns {string} the result is {}`).
    stray_found = 0
    for (k = type_end + 1; k <= len; k++) {
        if (substr(line, k, 1) == "{") {
            stray_found = 1
            break
        }
    }
    
    if (stray_found) {
        violations++
        print FILENAME "\tSTRAY_BLOCK\t" $0
    }
}

END {
    print "SUMMARY\t" file_count "\t" total_tags "\t" violations
}
' "${SCOPE_FILES[@]}")

# Parse the summary line (last line of output)
SUMMARY_LINE=$(echo "${AWK_OUTPUT}" | grep '^SUMMARY' | tail -1)
VIOLATIONS_OUTPUT=$(echo "${AWK_OUTPUT}" | grep -v '^SUMMARY')

# Extract counts
SCANNED_FILES_ACTUAL=$(echo "${SUMMARY_LINE}" | cut -f2)
TOTAL_TAGS=$(echo "${SUMMARY_LINE}" | cut -f3)
VIOLATIONS=$(echo "${SUMMARY_LINE}" | cut -f4)

# Build per-file violation counts
declare -A FILE_VIOLATIONS
while IFS=$'\t' read -r vfile vtype vline; do
    [ -z "${vfile}" ] && continue
    rel="${vfile#${REPO_ROOT}/}"
    FILE_VIOLATIONS["${rel}"]=$(( ${FILE_VIOLATIONS["${rel}"]:-0} + 1 ))
done <<< "${VIOLATIONS_OUTPUT}"

# --- Build scope label ---
SCOPE_LABEL=""
for raw in ${BALANCED_BRACES_SCOPE}; do
    if [ -n "${SCOPE_LABEL}" ]; then SCOPE_LABEL+=" "; fi
    if [ "${raw#/}" = "${raw}" ]; then
        SCOPE_LABEL+="${raw}"
    else
        SCOPE_LABEL+="${raw#${REPO_ROOT}/}"
    fi
done

# --- Output ---
echo "FR-3 Balanced-Brace JSDoc Guard — ${PHASE_LABEL}"
echo "=========================================="
echo "Scope:                  ${SCOPE_LABEL}"
echo "Scanned files:          ${SCANNED_FILES_ACTUAL}"
echo "Total typed tags:       ${TOTAL_TAGS}"
echo "Violations:             ${VIOLATIONS}"
echo ""

if [ "${VIOLATIONS}" -eq 0 ] || [ -z "${VIOLATIONS}" ]; then
    echo "PASS: All ${TOTAL_TAGS} typed @param/@returns tags in ${SCOPE_LABEL} have balanced braces."
    exit 0
fi

echo "FAIL: ${VIOLATIONS} malformed @param/@returns tag(s) in ${SCOPE_LABEL}."
echo ""
echo "Top ${BALANCED_BRACES_LIMIT} files (violation_count file_path):"
for k in "${!FILE_VIOLATIONS[@]}"; do
    echo "  ${FILE_VIOLATIONS[${k}]} ${k}"
done | sort -nr | head -n "${BALANCED_BRACES_LIMIT}"
echo ""
echo "First ${BALANCED_BRACES_LIMIT} violations:"
echo "${VIOLATIONS_OUTPUT}" | head -n "${BALANCED_BRACES_LIMIT}" | while IFS=$'\t' read -r vfile vtype vline; do
    [ -z "${vfile}" ] && continue
    rel="${vfile#${REPO_ROOT}/}"
    echo "  ${rel}: ${vtype} — ${vline}"
done
echo ""
echo "Runner-plumbing self-test (fixture):"
echo "  bash ${SCRIPTS_DIR#${REPO_ROOT}/}/check-jsdoc-balanced-braces.sh \\"
echo "    ${FIXTURES_DIR#${REPO_ROOT}/}/malformed-1.ts"
echo "  Expected: violations=1, exit 1."
exit 1
