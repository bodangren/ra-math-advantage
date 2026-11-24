// Phase S4 acceptance r2: F1 closure check. Read-only audit script.
// Part A: scan the real repo (apps/ and packages/, outside node_modules) byte by byte and
//         report where a banned token sits relative to each filter of the S4 gate.
// Part B: extract the REAL findBannedTokenMatches function from the gate file, run it on
//         a NUL-bearing source, and run it again with the old NUL skip put back.
// Part C: list the references of the NUL regression case and the two real scan sites.
// The only write is a temp folder in os.tmpdir(); the script removes it at the end.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { stripTypeScriptTypes } = require("node:module");

const ROOT = process.cwd();
const GATE = path.join(ROOT, "scripts/__tests__/openrouter-only.test.ts");
const ADV = path.join(ROOT, "scripts/__tests__/openrouter-s4-adversarial.test.ts");

const TOKENS = ["api.openai.com", "api.anthropic.com", "OPENAI_API_KEY", "AI_INTERPRETATION_"];
const BIN = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".pdf",
  ".db", ".sqlite", ".zip", ".gz", ".mp3", ".mp4", ".wasm",
]);
const EXCL = new Set(["node_modules", ".next", "dist"]);

// ---------- Part A ----------
const st = {
  visited: 0,
  scannedByGate: 0,
  skippedBinaryExtension: 0,
  inExcludedDir: 0,
  symlinks: [],
  unreadable: [],
  nulBearingScannedFiles: [],
  utf16Bom: [],
};
const hits = { gateScanned: [], binaryExtension: [], excludedDir: [], utf16Encoded: [] };
const utf16 = TOKENS.map((t) => [t, Buffer.from(t, "utf16le"), Buffer.from(t, "utf16le").swap16()]);

function checkFile(fp, inExcl) {
  st.visited += 1;
  const rel = path.relative(ROOT, fp);
  let buf;
  try {
    buf = fs.readFileSync(fp);
  } catch (err) {
    st.unreadable.push(rel);
    return;
  }
  const found = TOKENS.filter((t) => buf.includes(t));
  if (buf.length !== 0 && buf.length !== 1) {
    const bom = (buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff);
    if (bom) st.utf16Bom.push(rel);
  }
  for (const [t, le, be] of utf16) {
    if (buf.includes(le) || buf.includes(be)) hits.utf16Encoded.push(rel + ": " + t);
  }
  if (inExcl) {
    st.inExcludedDir += 1;
    for (const t of found) hits.excludedDir.push(rel + ": " + t);
    return;
  }
  if (BIN.has(path.extname(fp).toLowerCase())) {
    st.skippedBinaryExtension += 1;
    for (const t of found) hits.binaryExtension.push(rel + ": " + t);
    return;
  }
  st.scannedByGate += 1;
  if (buf.includes(0)) st.nulBearingScannedFiles.push(rel);
  for (const t of found) hits.gateScanned.push(rel + ": " + t);
}

function walk(dir, inExcl) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    st.unreadable.push(path.relative(ROOT, dir));
    return;
  }
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isSymbolicLink()) {
      st.symlinks.push(path.relative(ROOT, fp) + " points to " + fs.readlinkSync(fp));
      continue;
    }
    if (e.isDirectory()) {
      if (e.name === "node_modules") continue;
      walk(fp, inExcl || EXCL.has(e.name));
    } else if (e.isFile()) {
      checkFile(fp, inExcl);
    }
  }
}

walk(path.join(ROOT, "apps"), false);
walk(path.join(ROOT, "packages"), false);

const head = (a) => a.slice(0, 25);
console.log("PART A: real repo inventory (outside node_modules)");
console.log(
  JSON.stringify(
    {
      visited_files: st.visited,
      scanned_by_gate_logic: st.scannedByGate,
      skipped_by_binary_extension: st.skippedBinaryExtension,
      inside_excluded_dir_next_or_dist: st.inExcludedDir,
      symlink_count: st.symlinks.length,
      symlinks: head(st.symlinks),
      unreadable_count: st.unreadable.length,
      unreadable: head(st.unreadable),
      nul_bearing_scanned_file_count: st.nulBearingScannedFiles.length,
      nul_bearing_scanned_files: head(st.nulBearingScannedFiles),
      utf16_bom_file_count: st.utf16Bom.length,
      utf16_bom_files: head(st.utf16Bom),
      hit_count_gate_scanned: hits.gateScanned.length,
      hits_gate_scanned: head(hits.gateScanned),
      hit_count_binary_extension: hits.binaryExtension.length,
      hits_binary_extension: head(hits.binaryExtension),
      hit_count_excluded_dir: hits.excludedDir.length,
      hits_excluded_dir: head(hits.excludedDir),
      hit_count_utf16_encoded: hits.utf16Encoded.length,
      hits_utf16_encoded: head(hits.utf16Encoded),
    },
    null,
    1,
  ),
);

// ---------- Part B ----------
function grab(source, regex, label) {
  const m = source.match(regex);
  if (!m) throw new Error("cannot extract " + label);
  return m[0];
}

const gateSource = fs.readFileSync(GATE, "utf8");
const snippet = [
  grab(gateSource, /const BANNED_TOKENS = \[[\s\S]*?\];/, "BANNED_TOKENS"),
  grab(gateSource, /const BINARY_EXTENSIONS = new Set\(\[[\s\S]*?\]\);/, "BINARY_EXTENSIONS"),
  grab(gateSource, /function isBinaryPath[\s\S]*?\n}\n/, "isBinaryPath"),
  grab(gateSource, /function findBannedTokenMatches[\s\S]*?\n}\n/, "findBannedTokenMatches"),
].join("\n");

function buildScan(code, root) {
  const js = stripTypeScriptTypes(code);
  const factory = new Function("fs", "path", "REPO_ROOT", js + "\nreturn { findBannedTokenMatches };");
  return factory(fs, path, root).findBannedTokenMatches;
}

const OLD_SKIP = 'if (text.includes("\\0")) continue;';
const mutated = snippet.replace(
  /(for \(const token of BANNED_TOKENS\))/,
  OLD_SKIP + "\n    $1",
);
const mutationApplied = mutated !== snippet && mutated.includes(OLD_SKIP);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "acc2-f1-"));
try {
  const plain = path.join(tmp, "plain.ts");
  const nul = path.join(tmp, "nul.ts");
  const binExt = path.join(tmp, "asset.png");
  const line = 'const endpoint = "https://api.openai.com/v1";\n';
  fs.writeFileSync(plain, line, "utf8");
  fs.writeFileSync(nul, "// comment with a NUL marker \0\n" + line, "utf8");
  fs.writeFileSync(binExt, line, "utf8");
  const files = [plain, nul, binExt];

  const real = buildScan(snippet, tmp);
  const old = buildScan(mutated, tmp);
  const realHits = real(files);
  const oldHits = old(files);
  console.log("PART B: the real findBannedTokenMatches function from the gate file");
  console.log(
    JSON.stringify(
      {
        old_skip_mutation_applied_in_memory: mutationApplied,
        current_logic_hits: realHits,
        current_logic_hit_count: realHits.length,
        old_logic_hits: oldHits,
        old_logic_hit_count: oldHits.length,
        note: "asset.png is skipped by extension in both; nul.ts is a text source with a NUL in a comment",
      },
      null,
      1,
    ),
  );
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ---------- Part C ----------
const advSource = fs.readFileSync(ADV, "utf8");
const lines = advSource.split("\n");
const gateLines = gateSource.split("\n");
function refs(source, names) {
  const out = {};
  for (const n of names) out[n] = (source.match(new RegExp("\\b" + n + "\\b", "g")) || []).length;
  return out;
}
const names = ["findBannedTokenMatches", "findBannedTokensInText", "isBinaryPath", "listFiles", "readText"];
const regStart = advSource.indexOf('it("ADV-S4-1 NUL regression');
const regEnd = advSource.indexOf('it("ADV-S4-2 and ADV-S4-8');
const regBlock = advSource.slice(regStart, regEnd);
const scanStart = advSource.indexOf('it("ADV-S4-1: no scanned file under apps or packages');
const scanEnd = advSource.indexOf('it("ADV-S4-1 NUL regression');
const scanBlock = advSource.slice(scanStart, scanEnd);
console.log("PART C: reference map");
console.log(
  JSON.stringify(
    {
      regression_case_references: refs(regBlock, names),
      adversarial_real_repo_scan_references: refs(scanBlock, names),
      findBannedTokensInText_lines: lines
        .map((l, i) => [i + 1, l])
        .filter(([, l]) => /findBannedTokensInText/.test(l))
        .map(([n, l]) => n + ": " + l.trim()),
      nul_pattern_lines_adversarial: lines
        .map((l, i) => [i + 1, l])
        .filter(([, l]) => /\\0|\\x00|\\u0000|charCodeAt\(0\)|includes\(0\)/.test(l))
        .map(([n, l]) => n + ": " + l.trim()),
      nul_pattern_lines_gate: gateLines
        .map((l, i) => [i + 1, l])
        .filter(([, l]) => /\\0|\\x00|\\u0000|charCodeAt\(0\)|includes\(0\)/.test(l))
        .map(([n, l]) => n + ": " + l.trim()),
    },
    null,
    1,
  ),
);
