#!/usr/bin/env bash
# Phase 7 JSDoc Coverage Guard — Red baseline test for jsdoc-comments_20260526.
#
# Per measure/tracks/jsdoc-comments_20260526/test-strategy.md §1, this script is the
# "Graph delta checks" test tier (build-graph + summary count query). It is intentionally
# a shell guard, NOT a vitest file, because the strategy bans new vitest files for doc text.
#
# Lives under measure/tracks/<track>/scripts/ (Measure-owned test artifact, not an app
# script) to honor the Red-phase boundary: tests and Measure docs only, no application
# source paths modified.
#
# Asserts: zero functions in IM3 `app/`, `scripts/`, or "other" (middleware.ts, cloudflare/,
# e2e/, vite.config.ts) have NULL summaries in graph.db.
# Exit 0 = pass (Phase 7 acceptance met). Non-zero = fail (functions still undocumented).
#
# This is the Phase 7 sibling of check-jsdoc-coverage.sh (Phase 1 BM2 lib/),
# check-jsdoc-coverage-components.sh (Phase 2 BM2 components/),
# check-jsdoc-coverage-remaining.sh (Phase 3 BM2 app/convex/scripts/other),
# check-jsdoc-coverage-convex-im3.sh (Phase 4 IM3 convex/),
# check-jsdoc-coverage-components-im3.sh (Phase 5 IM3 components/), and
# check-jsdoc-coverage-im3-lib.sh (Phase 6 IM3 lib/). Same SQL shape, different scope —
# kept as a separate file so the per-phase acceptance gate stays a single command and so
# the JSON output reports the right phase label.
#
# Scope rationale: "other" in plan heading has no dedicated `other/` directory in IM3
# (only `app/`, `components/`, `convex/`, `lib/`, `scripts/`, `__tests__/`, `e2e/`,
# `public/`, `types/`, and root-level config files). Following the Phase 3 pattern for
# BM2 (which mapped "other" to `hooks/`, `middleware.ts`, `cloudflare/`, `vite.config.ts`),
# the Phase 7 guard enumerates the actual IM3 "other" surfaces:
#   - `middleware.ts`       (Next.js middleware — auth redirect gate)
#   - `cloudflare/`         (Cloudflare worker entry)
#   - `e2e/`                (Playwright E2E specs + fixtures)
#   - `vite.config.ts`      (Vite config — vitest driver for IM3)
# And unions them with `app/` and `scripts/` in the SQL OR. This matches the per-directory
# Task 7.1 / 7.2 mental model and the live graph count.
#
# The "other" subscope is intentionally NOT included in the global acceptance query in
# test-strategy.md §6 — that query filters by `package_id` and only catches `app/`, `lib/`,
# `components/`, `convex/`. This guard is the per-phase per-file scope complement.
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-app.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-app.sh --json
#
# Requires: build-graph on PATH, ./graph.db at repo root, IM3 files scanned.

set -euo pipefail

# Script lives at measure/tracks/jsdoc-comments_20260526/scripts/, so 4 levels up = repo root.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
GRAPH_DB="${GRAPH_DB:-${REPO_ROOT}/graph.db}"
PHASE_LABEL="Phase 7 (IM3 app/scripts/other)"

# Build the OR-list of file_path LIKE patterns covering the Phase 7 directories.
# Using OR rather than a single LIKE keeps the count assertions clear in JSON output and
# matches the per-directory Task 7.1 / 7.2 mental model.
SCOPE_PATTERN="(file_path LIKE '%/apps/integrated-math-3/app/%' OR file_path LIKE '%/apps/integrated-math-3/scripts/%' OR file_path LIKE '%/apps/integrated-math-3/middleware%' OR file_path LIKE '%/apps/integrated-math-3/cloudflare/%' OR file_path LIKE '%/apps/integrated-math-3/e2e/%' OR file_path LIKE '%/apps/integrated-math-3/vite.config%')"

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
# Per-subdir breakdown for the human-readable output (matches the table in phase-7-red-baseline.md).
QUERY_PER_DIR_NULL="SELECT file_path, COUNT(*) AS n FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND summary IS NULL GROUP BY file_path ORDER BY n DESC"

extract_count() {
    build-graph query "${GRAPH_DB}" "$1" 2>/dev/null | tail -n 1 | tr -d ' '
}

TOTAL="$(extract_count "${QUERY_TOTAL}")"
NULL_TOTAL="$(extract_count "${QUERY_NULL}")"
NULL_EXPORTED="$(extract_count "${QUERY_EXPORTED_NULL}")"
NULL_INTERNAL="$(extract_count "${QUERY_INTERNAL_NULL}")"

if [ "${JSON_MODE}" = "1" ]; then
    cat <<EOF
{"phase":"${PHASE_LABEL}","scope":"apps/integrated-math-3/{app,scripts,middleware,cloudflare,e2e,vite.config}","total_functions":${TOTAL},"null_summary_total":${NULL_TOTAL},"null_summary_exported":${NULL_EXPORTED},"null_summary_internal":${NULL_INTERNAL},"pass":$([ "${NULL_TOTAL}" = "0" ] && echo true || echo false)}
EOF
else
    echo "JSDoc Coverage Guard — ${PHASE_LABEL}"
    echo "==========================================="
    echo "Scope:                    apps/integrated-math-3/{app,scripts,middleware,cloudflare,e2e,vite.config}"
    echo "Total functions:          ${TOTAL}"
    echo "NULL summaries (total):   ${NULL_TOTAL}"
    echo "  - exported:             ${NULL_EXPORTED}  (Task 7.1 target)"
    echo "  - internal:             ${NULL_INTERNAL}  (Task 7.2 target)"
    echo ""
fi

if [ "${NULL_TOTAL}" = "0" ]; then
    [ "${JSON_MODE}" = "0" ] && echo "PASS: All ${TOTAL} functions in Phase 7 scope have JSDoc summaries."
    exit 0
fi

if [ "${JSON_MODE}" = "0" ]; then
    echo "FAIL: ${NULL_TOTAL} function(s) in Phase 7 scope still missing JSDoc summaries."
    echo ""
    echo "Per measure/tracks/jsdoc-comments_20260526/spec.md FR-1/FR-2, every exported AND internal"
    echo "function in scope must have a JSDoc block (summary, @param, @returns, @throws if applicable)."
    echo ""
    echo "Per-file breakdown (top 25 NULL files):"
    build-graph query "${GRAPH_DB}" \
        "${QUERY_PER_DIR_NULL} LIMIT 25" 2>/dev/null || true
    echo ""
    echo "Reproduce manually:"
    echo "  build-graph query ./graph.db \"${QUERY_NULL}\""
    echo ""
    echo "Refresh graph after edits:"
    echo "  build-graph scan . ./graph.db"
fi
exit 1
