#!/usr/bin/env bash
# Phase 9 JSDoc Coverage Guard — Red baseline test for jsdoc-comments_20260526.
#
# Per measure/tracks/jsdoc-comments_20260526/test-strategy.md §1, this script is the
# "Graph delta checks" test tier (build-graph + summary count query). It is intentionally
# a shell guard, NOT a vitest file, because the strategy bans new vitest files for doc text.
#
# Lives under measure/tracks/<track>/scripts/ (Measure-owned test artifact, not an app
# script) to honor the Red-phase boundary: tests and Measure docs only, no application
# source paths modified.
#
# Asserts: zero functions in packages/*/src/components/, packages/*/src/lib/, and other
# subdirectories (hooks/, utils/, types/) have NULL summaries in graph.db.
# Exit 0 = pass (Phase 9 acceptance met). Non-zero = fail (functions still undocumented).
#
# This is the Phase 9 sibling of check-jsdoc-coverage-packages-src.sh (Phase 8).
# Same SQL shape, different scope — Phase 8 covers packages/*/src/ top-level files,
# Phase 9 covers the subdirectories within src/.
#
# Scope rationale: Phase 9 covers every package's `src/components/`, `src/lib/`,
# `src/hooks/`, `src/utils/`, and `src/types/` directories. These are the remaining
# package functions not covered by Phase 8's `packages/*/src/` top-level scope.
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-packages-remaining.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-packages-remaining.sh --json
#
# Requires: build-graph on PATH, ./graph.db at repo root, packages/* files scanned.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
GRAPH_DB="${GRAPH_DB:-${REPO_ROOT}/graph.db}"
PHASE_LABEL="Phase 9 (Packages components/lib/other)"

# Build the OR-list of file_path LIKE patterns covering the Phase 9 subdirectories.
SCOPE_PATTERN="(file_path LIKE '%/packages/%/src/components/%' OR file_path LIKE '%/packages/%/src/lib/%' OR file_path LIKE '%/packages/%/src/hooks/%' OR file_path LIKE '%/packages/%/src/utils/%' OR file_path LIKE '%/packages/%/src/types/%') AND file_path NOT LIKE '%/node_modules/%' AND file_path NOT LIKE '%/.next/%' AND file_path NOT LIKE '%/dist/%' AND file_path NOT LIKE '%/__tests__/%'"

if ! command -v build-graph >/dev/null 2>&1; then
    echo "ERROR: build-graph not on PATH. Install per measure/lessons-learned.md or skip per Graph-Aware Mode rules." >&2
    exit 3
fi

if [ ! -f "${GRAPH_DB}" ]; then
    echo "ERROR: graph.db not found at ${GRAPH_DB}. Run 'build-graph scan ${REPO_ROOT} ${GRAPH_DB}' first." >&2
    exit 3
fi

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

QUERY_TOTAL="SELECT COUNT(*) FROM nodes WHERE type='function' AND ${SCOPE_PATTERN}"
QUERY_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND summary IS NULL"
QUERY_EXPORTED_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND tags LIKE '%exported%' AND summary IS NULL"
QUERY_INTERNAL_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND (tags NOT LIKE '%exported%' OR tags IS NULL) AND summary IS NULL"
QUERY_PER_FILE_NULL="SELECT file_path, COUNT(*) AS n FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND summary IS NULL GROUP BY file_path ORDER BY n DESC"

extract_count() {
    build-graph query "${GRAPH_DB}" "$1" 2>/dev/null | tail -n 1 | tr -d ' '
}

TOTAL="$(extract_count "${QUERY_TOTAL}")"
NULL_TOTAL="$(extract_count "${QUERY_NULL}")"
NULL_EXPORTED="$(extract_count "${QUERY_EXPORTED_NULL}")"
NULL_INTERNAL="$(extract_count "${QUERY_INTERNAL_NULL}")"

if [ "${JSON_MODE}" = "1" ]; then
    cat <<EOF
{"phase":"${PHASE_LABEL}","scope":"packages/*/src/{components,lib,hooks,utils,types}","total_functions":${TOTAL},"null_summary_total":${NULL_TOTAL},"null_summary_exported":${NULL_EXPORTED},"null_summary_internal":${NULL_INTERNAL},"pass":$([ "${NULL_TOTAL}" = "0" ] && echo true || echo false)}
EOF
else
    echo "JSDoc Coverage Guard — ${PHASE_LABEL}"
    echo "==========================================="
    echo "Scope:                    packages/*/src/{components,lib,hooks,utils,types}"
    echo "Total functions:          ${TOTAL}"
    echo "NULL summaries (total):   ${NULL_TOTAL}"
    echo "  - exported:             ${NULL_EXPORTED}  (Task 9.1 target)"
    echo "  - internal:             ${NULL_INTERNAL}  (Task 9.2 target)"
    echo ""
fi

if [ "${NULL_TOTAL}" = "0" ]; then
    [ "${JSON_MODE}" = "0" ] && echo "PASS: All ${TOTAL} functions in Phase 9 scope have JSDoc summaries."
    exit 0
fi

if [ "${JSON_MODE}" = "0" ]; then
    echo "FAIL: ${NULL_TOTAL} function(s) in Phase 9 scope still missing JSDoc summaries."
    echo ""
    echo "Per measure/tracks/jsdoc-comments_20260526/spec.md FR-1/FR-2, every exported AND internal"
    echo "function in scope must have a JSDoc block (summary, @param, @returns, @throws if applicable)."
    echo ""
    echo "Per-file NULL breakdown (top 25):"
    build-graph query "${GRAPH_DB}" \
        "${QUERY_PER_FILE_NULL} LIMIT 25" 2>/dev/null || true
    echo ""
    echo "Reproduce manually:"
    echo "  build-graph query ./graph.db \"${QUERY_NULL}\""
    echo ""
    echo "Refresh graph after edits:"
    echo "  build-graph scan . ./graph.db"
fi
exit 1
