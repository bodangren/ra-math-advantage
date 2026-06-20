#!/usr/bin/env bash
# Phase 3 FR-5 Typed-Param Guard — Red contract test for spec-compliance-and-process-integrity_20260612.
#
# Per measure/tracks/spec-compliance-and-process-integrity_20260612/test-strategy.md §1,
# this script is the "Tip: 1 new shell guard (typed-params)" tier. Artifact-only, no unit.
#
# Asserts: every JSDoc @param and @returns tag in the target scope carries a
# TypeScript-flavored `{type}` annotation immediately after the tag name. Per the
# track's plan.md Phase 3 (heading "Add FR-5 Type Annotations") and the spec's
# §B / FR-3: `@param {Type} name - description` and `@returns {Type} - description`.
#
# Naming note: the track's spec.md §B calls this "Universal FR-5 Violation" (the
# older jsdoc FR-5 naming); the new spec-compliance spec renames the same
# requirement as FR-3 ("TypeScript-flavored type annotations"). Both names refer
# to the same contract. This guard enforces the contract regardless of which
# name is cited in surrounding documentation.
#
# Detection scope (default): apps/integrated-math-3/convex/ (Phase 4 target).
# Override (space-separated): TYPED_PARAMS_SCOPE="/path/one /path/two /path/file.ts"
#
# The guard's parser is regex-based (line-by-line) and intentionally simple:
#   - A tag line is `* @param …` or `* @returns …` (leading `*` after optional
#     whitespace; the `/**` opener and `*/` closer are not consumed as tags).
#   - The line is "typed" iff it contains a `{...}` block immediately after the
#     `@param`/`@returns` keyword (whitespace allowed). Otherwise "untyped".
#   - Continuation lines (e.g., `*   more description text`) are NOT counted as
#     new tags. Only lines that begin `* @param` or `* @returns` are inspected.
#
# Why regex (not graph.db): the JSDoc `summary` field in graph.db does not
# capture the `@param {Type}` type — only the function-level summary. graph.db
# cannot prove typed params exist. A source-level regex scan is the only
# deterministic proof of the typed-param contract. The sibling coverage guards
# (check-jsdoc-coverage-*.sh) query graph.db for summary presence; this guard
# queries the source for type presence. The two are independent cross-checks.
#
# Test-strategy §7 P3 Red: running this guard on apps/integrated-math-3/convex/
# at HEAD must report >0 untyped (343 at baseline). Green: 0.
#
# Test-strategy §7 P3 closeout: a constructed bad-sample fixture must also fail
# this guard (bounded non-fake proof that the runner plumbing reports violations,
# not just passes silently). The fixture is a tiny TS file with 2 untyped + 2 typed
# tags, scoped via TYPED_PARAMS_SCOPE=<fixture-path>:
#   TYPED_PARAMS_SCOPE=measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/fixtures/typed-params-bad-sample.ts \
#     bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
# Expected: untyped=2, typed=2, exit 1.
#
# Per test-strategy §2, a fake fixture is permitted ONLY to prove the guard
# invokes the intended command path (runner plumbing) — not as a production
# gate. The production gate is the real-scope run; the fixture is supplementary.
#
# Lives under measure/tracks/<track>/scripts/ (Measure-owned test artifact, not
# app source) to honor the Red-phase boundary: tests + Measure docs only,
# no application code paths modified.
#
# Exit codes:
#   0 = pass (zero untyped @param/@returns in scope)
#   1 = fail (one or more untyped tags — FR-5 violation count printed)
#   3 = misuse (missing grep / xargs, scope path not found, no files in scope)
#
# Usage:
#   bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
#   bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
#   TYPED_PARAMS_SCOPE=/path/to/scope bash .../check-jsdoc-typed-params.sh
#   TYPED_PARAMS_SCOPE=.../typed-params-bad-sample.ts bash .../check-jsdoc-typed-params.sh

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SCRIPTS_DIR="${REPO_ROOT}/measure/tracks/spec-compliance-and-process-integrity_20260612/scripts"
DEFAULT_FIXTURE="${SCRIPTS_DIR}/fixtures/typed-params-bad-sample.ts"
SCOPE_DEFAULT="apps/integrated-math-3/convex/"
PHASE_LABEL="Phase 3 (FR-5 typed-params)"

# SCOPE env override. Space-separated list of paths (files or directories).
# Paths are resolved relative to REPO_ROOT if they don't start with `/`.
TYPED_PARAMS_SCOPE="${TYPED_PARAMS_SCOPE:-${SCOPE_DEFAULT}}"
TYPED_PARAMS_LIMIT="${TYPED_PARAMS_LIMIT:-25}"

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

if ! command -v grep >/dev/null 2>&1; then
    echo "ERROR: grep not on PATH" >&2
    exit 3
fi
if ! command -v xargs >/dev/null 2>&1; then
    echo "ERROR: xargs not on PATH" >&2
    exit 3
fi

# Resolve the scope list to absolute paths. Each entry is either a single file
# or a directory to recurse into.
declare -a RESOLVED_PATHS=()
for raw in ${TYPED_PARAMS_SCOPE}; do
    if [ "${raw#/}" = "${raw}" ]; then
        # Relative path — anchor at REPO_ROOT.
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
# declaration files, and standard build/dependency noise.
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
            -print0)
    fi
done

if [ "${#SCOPE_FILES[@]}" -eq 0 ]; then
    echo "ERROR: no .ts/.tsx files found in scope (TYPED_PARAMS_SCOPE='${TYPED_PARAMS_SCOPE}')" >&2
    exit 3
fi

# Tag-line regex (POSIX ERE):
#   - Optional leading whitespace, then either `*` (multi-line JSDoc) or `/**`
#     (single-line JSDoc), then optional whitespace, then `@param` or `@returns`,
#     then a word boundary or end-of-tag whitespace.
# Typed-body regex (POSIX ERE):
#   - Same tag prefix, then optional whitespace, then a non-empty `{...}` block.
#   - Single-line JSDoc tags (`/** @param {Type} name */`) are also detected.
# The current codebase has 0 single-line `@param`/`@returns` tags (verified via
# `rg --pcre2 '^\s*/\*\*\s*@(param|returns)\b' apps/ packages/` → 0 matches);
# the regex is permissive to handle future additions without re-tuning.
TAG_RE='^[[:space:]]*(\*|/\*\*)[[:space:]]*@(param|returns)([[:space:]]|$)'
TYPED_RE='^[[:space:]]*(\*|/\*\*)[[:space:]]*@(param|returns)[[:space:]]*\{[^}]+\}'

# Aggregate counts across all files in scope.
TOTAL_TAGS=0
TYPED_TAGS=0
UNTYPED_TAGS=0
PARAM_TOTAL=0
RETURNS_TOTAL=0
PARAM_TYPED=0
RETURNS_TYPED=0
SCANNED_FILES=${#SCOPE_FILES[@]}

# Per-file untyped counts (for human output / JSON breakdown).
declare -A FILE_UNTYPED
declare -A FILE_PARAM_UNTYPED
declare -A FILE_RETURNS_UNTYPED

for f in "${SCOPE_FILES[@]}"; do
    # All tag lines (typed + untyped). `grep -c` already prints "0" with exit 1 when
    # no match — `|| true` swallows the exit code without appending an extra "0".
    file_total=$(grep -cE "${TAG_RE}" "${f}" 2>/dev/null || true)
    file_total=${file_total:-0}
    file_typed=$(grep -cE "${TYPED_RE}" "${f}" 2>/dev/null || true)
    file_typed=${file_typed:-0}
    file_param=$(grep -cE '^[[:space:]]*(\*|/\*\*)[[:space:]]*@param([[:space:]]|$)' "${f}" 2>/dev/null || true)
    file_param=${file_param:-0}
    file_returns=$(grep -cE '^[[:space:]]*(\*|/\*\*)[[:space:]]*@returns([[:space:]]|$)' "${f}" 2>/dev/null || true)
    file_returns=${file_returns:-0}
    file_param_typed=$(grep -cE '^[[:space:]]*(\*|/\*\*)[[:space:]]*@param[[:space:]]*\{[^}]+\}' "${f}" 2>/dev/null || true)
    file_param_typed=${file_param_typed:-0}
    file_returns_typed=$(grep -cE '^[[:space:]]*(\*|/\*\*)[[:space:]]*@returns[[:space:]]*\{[^}]+\}' "${f}" 2>/dev/null || true)
    file_returns_typed=${file_returns_typed:-0}
    file_untyped=$((file_total - file_typed))

    TOTAL_TAGS=$((TOTAL_TAGS + file_total))
    TYPED_TAGS=$((TYPED_TAGS + file_typed))
    UNTYPED_TAGS=$((UNTYPED_TAGS + file_untyped))
    PARAM_TOTAL=$((PARAM_TOTAL + file_param))
    RETURNS_TOTAL=$((RETURNS_TOTAL + file_returns))
    PARAM_TYPED=$((PARAM_TYPED + file_param_typed))
    RETURNS_TYPED=$((RETURNS_TYPED + file_returns_typed))

    if [ "${file_untyped}" -gt 0 ]; then
        rel="${f#${REPO_ROOT}/}"
        FILE_UNTYPED["${rel}"]="${file_untyped}"
        FILE_PARAM_UNTYPED["${rel}"]=$((file_param - file_param_typed))
        FILE_RETURNS_UNTYPED["${rel}"]=$((file_returns - file_returns_typed))
    fi
done

# Build the human-readable scope label (relative to repo root).
SCOPE_LABEL=""
for raw in ${TYPED_PARAMS_SCOPE}; do
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
    for k in "${!FILE_UNTYPED[@]}"; do
        if [ "${first}" = "1" ]; then first=0; else files_json+=","; fi
        esc_k=$(printf '%s' "${k}" | sed 's/"/\\"/g')
        files_json+="{\"file\":\"${esc_k}\",\"untyped\":${FILE_UNTYPED[${k}]},\"untyped_param\":${FILE_PARAM_UNTYPED[${k}]},\"untyped_returns\":${FILE_RETURNS_UNTYPED[${k}]}}"
    done
    files_json+="]"
    printf '{"phase":"%s","scope":"%s","scanned_files":%d,"total_tags":%d,"typed_tags":%d,"untyped_tags":%d,"param_total":%d,"param_typed":%d,"returns_total":%d,"returns_typed":%d,"pass":%s,"files_untyped":%s}\n' \
        "${PHASE_LABEL}" "${SCOPE_LABEL}" "${SCANNED_FILES}" \
        "${TOTAL_TAGS}" "${TYPED_TAGS}" "${UNTYPED_TAGS}" \
        "${PARAM_TOTAL}" "${PARAM_TYPED}" "${RETURNS_TOTAL}" "${RETURNS_TYPED}" \
        "$([ "${UNTYPED_TAGS}" = "0" ] && echo true || echo false)" \
        "${files_json}"
else
    echo "FR-5 Typed-Param Guard — ${PHASE_LABEL}"
    echo "=========================================="
    echo "Scope:                  ${SCOPE_LABEL}"
    echo "Scanned files:          ${SCANNED_FILES}"
    echo "Total @param/@returns:  ${TOTAL_TAGS}"
    echo "  - @param:             ${PARAM_TOTAL} (${PARAM_TYPED} typed, $((PARAM_TOTAL - PARAM_TYPED)) untyped)"
    echo "  - @returns:           ${RETURNS_TOTAL} (${RETURNS_TYPED} typed, $((RETURNS_TOTAL - RETURNS_TYPED)) untyped)"
    echo "Typed (with {Type}):    ${TYPED_TAGS}"
    echo "Untyped (no {Type}):    ${UNTYPED_TAGS}"
    echo ""
fi

if [ "${UNTYPED_TAGS}" = "0" ]; then
    [ "${JSON_MODE}" = "0" ] && echo "PASS: All ${TOTAL_TAGS} @param/@returns tags in ${SCOPE_LABEL} carry {Type} annotations."
    exit 0
fi

if [ "${JSON_MODE}" = "0" ]; then
    echo "FAIL: ${UNTYPED_TAGS} untyped @param/@returns tag(s) in ${SCOPE_LABEL}."
    echo ""
    echo "Per spec.md §B (Universal FR-5 Violation) / FR-3 and plan.md Phase 3 (Add FR-5"
    echo "Type Annotations): every @param and @returns must carry a TypeScript-flavored"
    echo "\`{Type}\` annotation immediately after the tag name, e.g.:"
    echo "  * @param {MutationCtx} ctx - The mutation context"
    echo "  * @returns {Promise<Object>} The result payload"
    echo ""
    echo "Top ${TYPED_PARAMS_LIMIT} files (untyped_count file_path):"
    for k in "${!FILE_UNTYPED[@]}"; do
        echo "  ${FILE_UNTYPED[${k}]} ${k} (param=${FILE_PARAM_UNTYPED[${k}]}, returns=${FILE_RETURNS_UNTYPED[${k}]})"
    done | sort -nr | head -n "${TYPED_PARAMS_LIMIT}"
    echo ""
    echo "Reproduce manually:"
    echo "  grep -rnE '^[[:space:]]*\\*[[:space:]]*@(param|returns)([[:space:]]|\$)' ${SCOPE_LABEL} \\"
    echo "    | grep -vE '^[[:space:]]*\\*[[:space:]]*@(param|returns)[[:space:]]*\\{[^}]+\\}'"
    echo ""
    echo "Runner-plumbing self-test (closeout gate per test-strategy §7 P3):"
    echo "  TYPED_PARAMS_SCOPE=${DEFAULT_FIXTURE#${REPO_ROOT}/} bash \\"
    echo "    measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh"
    echo "  Expected: untyped=2, typed=2, exit 1."
fi
exit 1
