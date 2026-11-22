#!/usr/bin/env bash
# Reuse the comparison and resume logic from the archived toolchain runner.
# Usage: gates.sh <format|lint|typecheck|test|build|support|docs|checks-all> <label>
# Additional commands: gates.sh audit-high <label>; gates.sh targets.
# Run groups serially. Each job uses heavy-run.sh without an outer wrapper.
# Set GATES_BASE for comparisons. Baseline labels contain "-baseline".
# Set GATES_RESUME=1 to retain completed jobs and retry infrastructure jobs.
# Exits: 0 baseline/no new failure, 1 new failure, 2 usage, 3 infrastructure.
set -u

has_script() {
  node -e 'const s=require(process.argv[1]).scripts||{};process.exit(s[process.argv[2]]?0:1)' "$PWD/$1/package.json" "$2"
}

DISK_FULL_RE="ENOSPC: no space left on device|EDQUOT: disk quota exceeded|Error: (ENOSPC|EDQUOT)|errno: -(28|122)|code: ['\"]?(ENOSPC|EDQUOT)['\"]?|^No space left on device \\(os error 28\\)$|^Error: spawn (ENOSPC|EDQUOT)$"
has_infra_output() {
  grep -qE "$DISK_FULL_RE|^npm error code (EAI_AGAIN|ENOTFOUND|ECONNRESET|ETIMEDOUT)$" "$1" 2>/dev/null
}

# Keep workspace/file/code and test file/title keys. Remove positions and timings.
key() {
  grep -E 'TS[0-9]+|error|ERROR|FAIL|AssertionError|Failed to resolve|[0-9] (warning|error)|invalid:|missing:|extraneous:' "$1" 2>/dev/null |
    grep -vE "$DISK_FULL_RE|^heavy-run:" |
    grep -v '^[[:space:]]*✓' |
    grep -vE '^[[:space:]]*[+-]' |
    grep -vE '^[[:space:]]*[0-9]+\|' |
    LC_ALL=C sed -E "s/^(AssertionError: expected )'.*'( to )/\1'<value>'\2/" |
    LC_ALL=C sed -E 's/^([[:space:]]*× .*)[[:space:]]+\(?[0-9.]+ ?m?s\)?$/\1/' |
    LC_ALL=C sed -E 's/^([^ (]+)\([0-9]+,[0-9]+\): error (TS[0-9]+):.*/\1 \2/; s/^npm error code [0-9]+$/npm error code/; s#^(npm error A complete log of this run can be found in: ).*#\1<log path>#; /FAIL/! s/\([0-9]+,[0-9]+\)//g; /FAIL/! s/:[0-9]+:[0-9]+//g; s/[[:space:]]+$//' | LC_ALL=C sort -u
}

new_keys() {
  [ -f "$1" ] || return 0
  [ -n "$(comm -13 <(key "$1") <(key "$2"))" ]
}
base_code() { awk -v n="$2" '$1==n{v=$2} END{print v}' "$1" 2>/dev/null; }
timing_code() {
  awk -v k="$2" -v n="$3" '$1==k && $2==n {for(i=1;i<=NF;i++) if($i ~ /^exit=/) v=substr($i,6)} END{print v}' "$1" 2>/dev/null
}
resume_valid() {
  local log=$1 cmdfile=$2 kind=$3 item=$4 record=$5; shift 5
  [ -s "$log" ] && [ -s "$cmdfile" ] || return 1
  [ "$(cat "$cmdfile")" = "$(printf '%q ' "$@")" ] || return 1
  local last
  last=$(grep -v '^[[:space:]]*$' "$log" | tail -n 1)
  [ -z "$(printf '%s' "$last" | grep -E '^[[:space:]]*>[[:space:]]')" ] || return 1
  if [ "$record" = 0 ] && grep -qE '(^|[[:space:]])FAIL |^error:|^AssertionError|[[:space:]]error:' "$log"; then return 1; fi
  local tc
  tc=$(timing_code "$OUT/timing.txt" "$kind" "$item")
  [ -z "$tc" ] || [ "$tc" = "$record" ] || return 1
  return 0
}
is_infra() { [[ "$INFRA" == *" $1 "* ]]; }
is_record_only() { case "$LABEL" in *-baseline*|baseline*) return 0 ;; *) return 1 ;; esac; }

run_job() {
  local kind=$1 name=$2 log=$3 t0 t1
  shift 3
  printf '%q ' "$@" > "$log.command"
  printf '\n' >> "$log.command"
  t0=$(date +%s)
  "$H" "$@" > "$log" 2>&1
  JOB_CODE=$?
  if has_infra_output "$log"; then JOB_CODE=290; fi
  t1=$(date +%s)
  echo "$kind $name $((t1 - t0)) exit=$JOB_CODE" >> "$OUT/timing.txt"
}

compare_result() {
  local name=$1 code=$2 bc=$3 old=$4 log=$5
  if is_infra "$code"; then
    echo "INFRA FAILURE: $name exit $code"; infra=1; return
  fi
  if [ "$code" != n/a ] && [ ! -f "$log" ]; then
    echo "NEW FAILURE: $name missing log"; newfail=1; return
  fi
  if is_record_only; then return; fi
  if [ -z "$bc" ] || { [ "$bc" != n/a ] && [ ! -f "$old" ]; }; then
    echo "NEW FAILURE: $name missing comparison result"; newfail=1
  elif is_infra "$bc"; then
    echo "INFRA FAILURE: $name baseline exit $bc"; infra=1
  elif [ "$code" = n/a ] && [ "$bc" != n/a ]; then
    echo "NEW FAILURE: $name script removed"; newfail=1
  elif [ "$code" != 0 ] && [ "$code" != n/a ]; then
    if [ "$bc" = 0 ] || [ "$bc" = n/a ] || new_keys "$old" "$log"; then
      echo "NEW FAILURE: $name has a new diagnostic or exit"; newfail=1
    fi
  fi
}

sweep() {
  local s=$1 ws name code bc rec diffnames
  [ "$RESUME" = 1 ] || : > "$OUT/$s.exit"
  touch "$OUT/$s.exit"
  while IFS= read -r ws; do
    name=${ws//\//-}
    rec=$(base_code "$OUT/$s.exit" "$ws")
    if [ "$RESUME" = 1 ] && [ -n "$rec" ] && ! is_infra "$rec" &&
      { [ "$rec" = n/a ] || resume_valid "$OUT/$s-$name.log" "$OUT/$s-$name.log.command" "$s" "$ws" "$rec" npm run "$s" --workspace="$ws"; }; then
      code=$rec
    else
      if has_script "$ws" "$s"; then
        run_job "$s" "$ws" "$OUT/$s-$name.log" npm run "$s" --workspace="$ws"
        code=$JOB_CODE
      else
        code=n/a
      fi
      echo "$ws $code" >> "$OUT/$s.exit"
    fi
    bc=$(base_code "$BASE/$s.exit" "$ws")
    compare_result "$s $ws" "$code" "$bc" "$BASE/$s-$name.log" "$OUT/$s-$name.log"
  done <<< "$WORKSPACES"
  if [ "$(grep -vc ' n/a$' "$OUT/$s.exit")" -eq 0 ]; then
    echo "NEW FAILURE: $s ran in no workspace"; newfail=1
  fi
  if ! is_record_only; then
    diffnames=$(LC_ALL=C comm -3 <(awk '{print $1}' "$BASE/$s.exit" 2>/dev/null | LC_ALL=C sort -u) \
      <(printf '%s\n' "$WORKSPACES" | LC_ALL=C sort -u) | tr -d '\t' | tr '\n' ' ')
    if [ -n "$diffnames" ]; then
      echo "NEW FAILURE: $s workspace set differs: $diffnames"; newfail=1
    fi
  fi
}

step() {
  local n=$1 c bc rec
  shift
  rec=$(base_code "$OUT/$GATE.steps" "$n")
  if [ "$RESUME" = 1 ] && [ -n "$rec" ] && ! is_infra "$rec" &&
     resume_valid "$OUT/step-$n.log" "$OUT/step-$n.log.command" step "$n" "$rec" "$@"; then
    c=$rec
  else
    run_job step "$n" "$OUT/step-$n.log" "$@"
    c=$JOB_CODE
    echo "$n $c" >> "$OUT/$GATE.steps"
  fi
  bc=$(base_code "$BASE/$GATE.steps" "$n")
  compare_result "step $n" "$c" "$bc" "$BASE/step-$n.log" "$OUT/step-$n.log"
}

# Validate the full report. Audit findings normally produce exit 1.
audit_step() {
  "$H" npm audit --json > "$OUT/audit.json" 2> "$OUT/audit.stderr"
  local code=$? reason
  if is_infra "$code" || has_infra_output "$OUT/audit.stderr"; then
    echo "INFRA FAILURE: audit exit $code"; infra=1; return
  fi
  reason=$(node -e '
    const fs = require("node:fs");
    let d;
    try { d = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); }
    catch { console.log("response is not JSON"); process.exit(0); }
    if (d && d.error) { console.log(`error object: ${d.error.code || d.error.summary || "unknown"}`); process.exit(0); }
    const v = d && d.metadata && d.metadata.vulnerabilities;
    if (!v || typeof v !== "object" || Array.isArray(v)) { console.log("missing metadata.vulnerabilities"); process.exit(0); }
    for (const s of ["critical", "high", "moderate", "low"]) {
      if (!Number.isInteger(v[s]) || v[s] < 0) { console.log(`invalid ${s} count`); process.exit(0); }
    }
    if (!d.vulnerabilities || typeof d.vulnerabilities !== "object" || Array.isArray(d.vulnerabilities)) { console.log("missing vulnerabilities"); process.exit(0); }
    for (const s of ["critical", "high", "moderate", "low"]) {
      const n = Object.values(d.vulnerabilities).filter(x => x && x.severity === s).length;
      if (n !== v[s]) { console.log(`${s} count mismatch: metadata ${v[s]} entries ${n}`); process.exit(0); }
    }
  ' "$OUT/audit.json") || reason="report could not be validated"
  if [ -n "$reason" ] || { [ "$code" != 0 ] && [ "$code" != 1 ]; }; then
    echo "INFRA FAILURE: audit ${reason:-unexpected exit $code}"; infra=1; return
  fi
  node -e 'const m=require(process.argv[1]).metadata.vulnerabilities;console.log(`critical=${m.critical} high=${m.high} moderate=${m.moderate} low=${m.low}`)' "$OUT/audit.json" > "$OUT/audit.txt"
  echo "audit: $(cat "$OUT/audit.txt")"
  if is_record_only || [ "$GATE" = audit-high ]; then return; fi
  local f c b
  for f in critical high; do
    c=$(sed -n "s/.*$f=\([0-9][0-9]*\).*/\1/p" "$OUT/audit.txt")
    b=$(sed -n "s/.*$f=\([0-9][0-9]*\).*/\1/p" "$BASE/audit.txt" 2>/dev/null)
    if [ -z "$c" ] || [ -z "$b" ]; then echo "NEW FAILURE: audit $f count not parsed"; newfail=1
    elif [ "$c" -gt "$b" ]; then echo "NEW FAILURE: audit $f $b -> $c"; newfail=1; fi
  done
}

audit_high() {
  audit_step
  [ "$infra" = 0 ] || return
  node -e '
    const fs = require("node:fs");
    const d = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const text = fs.readFileSync(process.argv[2], "utf8").split("## D1 High Exceptions")[1]?.split(/\n## /)[0] || "";
    const exceptions = new Map();
    for (const line of text.split("\n")) {
      const cells = line.split("|").slice(1, -1).map(s => s.trim().replace(/`/g, ""));
      if (/^(GHSA-[\w-]+|npm:\d+)$/.test(cells[0] || "") && cells.length === 5 && cells.every(Boolean)) {
        if (!exceptions.has(cells[0])) exceptions.set(cells[0], []);
        exceptions.get(cells[0]).push({ pkg: cells[1], path: cells[3] });
      }
    }
    function parents(node) {
      const s = String(node);
      const out = [];
      const re = /node_modules\/((?:@[^/]+\/)?[^/]+)/g;
      let m;
      while ((m = re.exec(s)) !== null) out.push(m[1]);
      if (out.length > 1) return out.slice(0, -1);
      const idx = s.indexOf("/node_modules/");
      if (idx > 0) {
        const w = s.slice(0, idx).split("/").pop();
        if (w) return [w];
      }
      return [];
    }
    function pathPackages(p) {
      const out = new Set();
      for (const seg of p.split(">")) {
        for (const part of seg.split(/\s+\/\s+/)) {
          const name = part.trim().replace(/\s+\d[\w.-]*$/, "");
          if (name) out.add(name);
        }
      }
      return out;
    }
    function ids(name, seen = new Set()) {
      if (seen.has(name)) return [];
      const v = d.vulnerabilities[name];
      if (!v || !Array.isArray(v.via)) throw Error(`unresolved advisory path: ${name}`);
      const next = new Set([...seen, name]);
      return v.via.flatMap(via => typeof via === "string" ? ids(via, next) :
        /^(high|critical)$/.test(via.severity) ? [via.url?.match(/GHSA-[\w-]+/)?.[0] || (via.source ? `npm:${via.source}` : "")] : []);
    }
    let failed = false, high = false;
    try {
      for (const [name, v] of Object.entries(d.vulnerabilities)) {
        if (!/^(high|critical)$/.test(v.severity)) continue;
        high = true;
        const found = ids(name);
        if (!found.length || found.some(id => !id)) throw Error(`missing advisory identifier: ${name}`);
        for (const id of new Set(found)) {
          const rows = (exceptions.get(id) || []).filter(r => r.pkg === name);
          if (!rows.length) { console.error(`Unresolved high/critical: ${name} ${id}`); failed = true; continue; }
          const nodes = Array.isArray(v.nodes) && v.nodes.length ? v.nodes : [`node_modules/${name}`];
          const covered = nodes.every(node => parents(node).every(p =>
            rows.some(r => pathPackages(r.path).has(p))));
          if (!covered) { console.error(`Undisclosed dependency path: ${name} ${id} ${nodes.join(", ")}`); failed = true; }
          else console.log(`Named exception: ${name} ${id}`);
        }
      }
      if ((d.metadata.vulnerabilities.high || d.metadata.vulnerabilities.critical) && !high) throw Error("missing high/critical entries");
    } catch (e) { console.error(e.message); process.exit(3); }
    process.exit(failed ? 1 : 0);
  ' "$OUT/audit.json" "$REPO/measure/tracks/dependency-refresh_20261121/evidence.md"
  local code=$?
  if [ "$code" = 3 ]; then infra=1; elif [ "$code" != 0 ]; then newfail=1; fi
}

# The D2 Red/Green command reads targets from the plan, not a new test file.
targets() {
  node -e '
    const fs = require("node:fs"), path = require("node:path").posix;
    const text = fs.readFileSync("measure/tracks/dependency-refresh_20261121/plan.md", "utf8").split("### D2 Targets")[1]?.split(/\n## /)[0] || "";
    const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8")).packages;
    const rows = text.split("\n").filter(s => /^\| (?:package\.json|(?:apps|packages)\/[^|]+\/package\.json) \|/.test(s));
    if (!rows.length) { console.error("D2 target list is empty"); process.exit(1); }
    let failed = false;
    for (const row of rows) {
      const [manifest, name, target, decision] = row.split("|").slice(1, -1).map(s => s.trim().replace(/`/g, ""));
      const retainedPrerelease = /^\d+\.\d+\.\d+-[\w.-]+$/.test(target) && decision?.startsWith("Deferred:");
      if ((!/^\d+\.\d+\.\d+$/.test(target) && !retainedPrerelease) || !decision) { console.error(`Invalid target row: ${row}`); failed = true; continue; }
      let dir = path.dirname(manifest), entry;
      while (true) {
        entry = lock[path.join(dir, "node_modules", name)];
        if (entry || dir === ".") break;
        dir = path.dirname(dir);
      }
      const version = entry?.version;
      if (retainedPrerelease) {
        if (version !== target) { console.error(`Retained pin differs: ${manifest} ${name}`); failed = true; }
        else console.log(`Deferred existing pin: ${manifest} ${name} ${version}`);
        continue;
      }
      const actual = /^\d+\.\d+\.\d+$/.test(version || "") ? version.split(".").map(Number) : [];
      const wanted = target.split(".").map(Number);
      const difference = actual.length ? actual.map((n, i) => Math.sign(n - wanted[i])).find(n => n !== 0) || 0 : -1;
      if (difference < 0) { console.error(`Below target: ${manifest} ${name} ${version || "missing"} < ${target}`); failed = true; }
      else console.log(`Target met: ${manifest} ${name} ${version} >= ${target}`);
    }
    process.exit(failed ? 1 : 0);
  '
}

bundle() {
  local app=$1 script=$2 name=${1##*/} code
  step "bundle-$name" npm run "$script" --workspace="$app"
  local total_script="$OUT/total-bytes.cjs"
  cat > "$total_script" <<'TOTAL_EOF'
const fs = require("node:fs");
const path = require("node:path");
function size(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) =>
    n + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
}
const total = size(process.argv[2]);
if (!total) throw Error("empty bundle");
console.log(`TOTAL_BYTES=${total}`);
TOTAL_EOF
  step "total-$name" node "$total_script" "$app/dist"
  node -e '
    const fs = require("node:fs");
    const [out, base, name, source, record] = process.argv.slice(1);
    const text = fs.readFileSync(`${out}/step-bundle-${name}.log`, "utf8");
    const patterns = [...fs.readFileSync(source, "utf8").matchAll(/(?:pattern: |^  )"([^"\n]+)"(?::|,)/gm)].map(m => m[1]);
    const lineRe = /^\[(OK|EXCEEDS)\] (.+?): ([\d.]+) KB \(threshold: [\d.]+ KB\)$/;
    const parse = t => {
      const lines = t.split("\n").map(s => s.trim()).filter(s => /^\[(OK|EXCEEDS)\]/.test(s));
      for (const line of lines) if (!lineRe.test(line)) throw Error(`malformed bundle report entry: ${line}`);
      return lines.map(line => {
        const m = line.match(lineRe);
        return { status: m[1], label: m[2], key: m[2].replace(/-[A-Za-z0-9_-]{8}(?=\.(?:js|css)$)/g, "-*"), kb: Number(m[3]) };
      });
    };
    const entries = parse(text);
    if (!entries.length || !patterns.some(p => entries.some(e => e.label.startsWith(p + " → ")))) throw Error("missing bundle budget match");
    const total = dir => {
      const n = Number(fs.readFileSync(`${dir}/step-total-${name}.log`, "utf8").match(/^TOTAL_BYTES=(\d+)$/m)?.[1]);
      if (!(n > 0)) throw Error("missing bundle total");
      return n;
    };
    const now = total(out);
    if (record === "1") process.exit(0);
    const old = parse(fs.readFileSync(`${base}/step-bundle-${name}.log`, "utf8"));
    if (!old.length) throw Error("empty baseline budget report");
    let failed = false;
    const counts = new Map();
    for (const e of entries) {
      if (!counts.has(e.key)) counts.set(e.key, new Set());
      counts.get(e.key).add(e.label);
    }
    for (const key of new Set(old.map(e => e.key))) {
      const want = new Set(old.filter(e => e.key === key).map(e => e.label)).size;
      const got = counts.has(key) ? counts.get(key).size : 0;
      if (got < want) { console.error(`Missing baseline budget chunk: ${name} ${key} ${got} of ${want}`); failed = true; }
    }
    const exceedCounts = list => {
      const m = new Map();
      for (const e of list) if (e.status === "EXCEEDS") {
        if (!m.has(e.key)) m.set(e.key, new Set());
        m.get(e.key).add(e.label);
      }
      return m;
    };
    const oldExceeds = exceedCounts(old);
    for (const [key, labels] of exceedCounts(entries)) {
      const want = oldExceeds.has(key) ? oldExceeds.get(key).size : 0;
      if (labels.size > want) { console.error(`New budget failures: ${name} ${key} ${want} -> ${labels.size}`); failed = true; }
    }
    for (const entry of entries) {
      if (entry.status !== "EXCEEDS") continue;
      const prev = old.find(e => e.key === entry.key && e.status === "EXCEEDS");
      if (prev && entry.kb > prev.kb) { console.error(`Larger budget failure: ${name} ${entry.key} ${prev.kb} -> ${entry.kb} KB`); failed = true; }
    }
    const before = total(base);
    console.log(`${name} total bytes: ${before} -> ${now}`);
    if (now > before * 1.05) { console.error(`Bundle growth exceeds 5%: ${name}`); failed = true; }
    process.exit(failed ? 1 : 0);
  ' "$OUT" "$BASE" "$name" "$app/scripts/bundle-size-audit.mjs" "$(is_record_only && echo 1 || echo 0)"
  code=$?
  if [ "$code" != 0 ]; then newfail=1; fi
}

main() {
  local script_dir group result=0 code
  script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd) || exit 2
  REPO=$(cd "$script_dir/../../.." && pwd) || exit 2
  cd "$REPO" || exit 2
  GATE=${1:-}
  if [ "$GATE" = targets ]; then targets; return $?; fi
  LABEL=${2:-}
  [[ "$LABEL" =~ ^[a-zA-Z0-9_-]+$ ]] || return 2
  case "$GATE" in format|lint|typecheck|test|build|support|docs|checks-all|audit-high) ;; *) return 2 ;; esac
  if [ "$GATE" = checks-all ]; then
    for group in format typecheck build support docs; do
      bash "$script_dir/gates.sh" "$group" "$LABEL"
      code=$?
      if [ "$code" -gt "$result" ]; then result=$code; fi
    done
    return "$result"
  fi
  export CI=true
  H=${HEAVY_RUN:-$HOME/Desktop/advantage-pr/scripts/jobs/heavy-run.sh}
  [ -x "$H" ] || return 2
  RESUME=${GATES_RESUME:-0}
  local gates="$REPO/measure/runs/dependency-refresh_20261121/gates"
  OUT=$gates/$LABEL/$GATE
  BASE=$gates/${GATES_BASE:-d1-baseline}/$GATE
  if [ -e "$OUT" ] && [ "$RESUME" != 1 ]; then
    echo "Results already exist: $OUT. Use a new label or GATES_RESUME=1." >&2; return 2
  fi
  mkdir -p "$OUT" || return 2
  INFRA=" 64 65 70 75 77 124 137 143 201 290 "
  newfail=0; infra=0; JOB_CODE=0
  WORKSPACES=$(node -e 'const m=require("./scripts/architecture/architecture.manifest.json");if(!m.workspaces?.length)process.exit(2);for(const w of m.workspaces)console.log(w.path)') || return 2
  [ "$RESUME" = 1 ] || : > "$OUT/$GATE.steps"
  touch "$OUT/$GATE.steps"
  case "$GATE" in
    format) step format npm run format:check ;;
    lint|typecheck|build) sweep "$GATE" ;;
    test)
      sweep test
      step scripts-suite npx --no-install vitest run --config scripts/vitest.config.ts
      step audit-suites npx --no-install vitest run scripts/audit/__tests__
      ;;
    support)
      step boundary node scripts/check-monorepo-boundaries.mjs
      step ci-check node scripts/validate-ci.mjs
      step tree npm ls --all
      audit_step
      step sdk npm run test --workspace=packages/ai-tutoring
      step s1-bm2 npm run test --workspace=apps/bus-math-v2 -- __tests__/lib/ai/providers.test.ts __tests__/app/api/student/lesson-chatbot __tests__/api/student/lesson-chatbot.test.ts
      step s1-im3 npm run test --workspace=apps/integrated-math-3 -- __tests__/app/api/student/lesson-chatbot
      step workerd npm run test:workerd --workspace=packages/ai-tutoring
      bundle apps/integrated-math-3 bundle-size:audit
      bundle apps/bus-math-v2 bundle:audit
      ;;
    docs)
      step generate npm run generate
      step doctor npm run doctor
      ;;
    audit-high) audit_high ;;
  esac
  echo "NEWFAIL=$newfail"
  [ "$infra" = 0 ] || { echo "INFRA=1"; return 3; }
  if is_record_only && [ "$newfail" = 0 ]; then return 0; fi
  return "$newfail"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then main "$@"; fi
