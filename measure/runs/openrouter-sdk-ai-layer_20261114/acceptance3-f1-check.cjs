// Phase S4 acceptance r3: F4 and hit-hiding filter check. Read-only audit script.
// Part A: scan the real repo (apps/ and packages/, outside node_modules) byte by byte and
//         report where a banned token sits relative to each filter of the S4 scans.
// Part B: run the REAL shared helper, and the REAL gate and adversarial wrappers, in memory
//         on a NUL-bearing source, and run the helper again with the old NUL skip put back.
// Part C: reference map: who calls the shared helper, who still names the dead helper, and
//         every content-based test of a file (NUL, byte, binary heuristic) in the three files.
// The only write is a temp folder in os.tmpdir(); the script removes it at the end.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { stripTypeScriptTypes } = require("node:module");

const ROOT = process.cwd();
const TESTS = path.join(ROOT, "scripts/__tests__");
const HELPER = path.join(TESTS, "openrouter-scan-shared.ts");
const GATE = path.join(TESTS, "openrouter-only.test.ts");
const ADV = path.join(TESTS, "openrouter-s4-adversarial.test.ts");

const TOKENS = ["api.openai.com", "api.anthropic.com", "OPENAI_API_KEY", "AI_INTERPRETATION_"];
const BIN = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".pdf",
  ".db", ".sqlite", ".zip", ".gz", ".mp3", ".mp4", ".wasm",
]);
const EXCL = new Set(["node_modules", ".next", "dist"]);

// ---------- Part A ----------
const st = {
  visited: 0,
  scannedByScans: 0,
  skippedBinaryExtension: 0,
  inExcludedDir: 0,
  symlinks: [],
  unreadable: [],
  nulBearingScannedFiles: [],
  utf16Bom: [],
};
const hits = { scanned: [], binaryExtension: [], excludedDir: [], utf16Encoded: [] };
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
  if (buf.length > 1) {
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
  st.scannedByScans += 1;
  if (buf.includes(0)) st.nulBearingScannedFiles.push(rel);
  for (const t of found) hits.scanned.push(rel + ": " + t);
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
      scanned_by_scan_logic: st.scannedByScans,
      skipped_by_binary_extension: st.skippedBinaryExtension,
      inside_excluded_dir_next_or_dist: st.inExcludedDir,
      symlink_count: st.symlinks.length,
      unreadable_count: st.unreadable.length,
      unreadable: head(st.unreadable),
      nul_bearing_scanned_file_count: st.nulBearingScannedFiles.length,
      utf16_bom_file_count: st.utf16Bom.length,
      hit_count_scanned: hits.scanned.length,
      hits_scanned: head(hits.scanned),
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
function toFunction(code, names, params) {
  const js = stripTypeScriptTypes(code);
  const factory = new Function(...params, js + "\nreturn { " + names.join(", ") + " };");
  return factory;
}

const helperSource = fs.readFileSync(HELPER, "utf8");
const gateSource = fs.readFileSync(GATE, "utf8");
const advSource = fs.readFileSync(ADV, "utf8");

// The helper without its import lines and the `export` keywords, so that new Function can run it.
const helperBody = helperSource
  .replace(/^import .*$/gm, "")
  .replace(/export const SHARED_REPO_ROOT/, "const SHARED_REPO_ROOT")
  .replace(/export function scanFilesForBannedTokens/, "function scanFilesForBannedTokens")
  .replace(/path\.dirname\(fileURLToPath\(import\.meta\.url\)\)/, JSON.stringify(TESTS));
const OLD_SKIP = 'if (text.includes("\\0")) continue;';
const helperMutated = helperBody.replace(/(\n\s*for \(const token of tokens\))/, "\n    " + OLD_SKIP + "$1");
const mutationApplied = helperMutated !== helperBody && helperMutated.includes(OLD_SKIP);

function buildHelper(body) {
  return toFunction(body, ["scanFilesForBannedTokens"], ["fs", "path"])(fs, path).scanFilesForBannedTokens;
}
function buildGateWrapper(scan) {
  const snippet = [
    grab(gateSource, /const BANNED_TOKENS = \[[\s\S]*?\];/, "gate BANNED_TOKENS"),
    grab(gateSource, /const BINARY_EXTENSIONS = new Set\(\[[\s\S]*?\]\);/, "gate BINARY_EXTENSIONS"),
    grab(gateSource, /function isBinaryPath[\s\S]*?\n}\n/, "gate isBinaryPath"),
    grab(gateSource, /function findBannedTokenMatches[\s\S]*?\n}\n/, "gate findBannedTokenMatches"),
  ].join("\n");
  return toFunction(snippet, ["findBannedTokenMatches"], ["fs", "path", "REPO_ROOT", "scanFilesForBannedTokens"])(fs, path, ROOT, scan)
    .findBannedTokenMatches;
}
function buildAdvWrapper(scan) {
  const snippet = [
    grab(advSource, /const BANNED_TOKENS = \[[\s\S]*?\];/, "adv BANNED_TOKENS"),
    grab(advSource, /const BINARY_EXTENSIONS = new Set\(\[[\s\S]*?\]\);/, "adv BINARY_EXTENSIONS"),
    grab(advSource, /function isBinaryPath[\s\S]*?\n}\n/, "adv isBinaryPath"),
    grab(advSource, /function scanRepoFilesForBannedTokens[\s\S]*?\n}\n/, "adv scanRepoFilesForBannedTokens"),
  ].join("\n");
  return toFunction(snippet, ["scanRepoFilesForBannedTokens"], ["fs", "path", "REPO_ROOT", "scanFilesForBannedTokens"])(fs, path, ROOT, scan)
    .scanRepoFilesForBannedTokens;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "acc3-f1-"));
try {
  const plain = path.join(tmp, "plain.ts");
  const nul = path.join(tmp, "nul.ts");
  const binExt = path.join(tmp, "asset.png");
  const unreadable = path.join(tmp, "dir-as-file.ts");
  fs.mkdirSync(unreadable);
  const line = 'const endpoint = "https://api.openai.com/v1";\n';
  fs.writeFileSync(plain, line, "utf8");
  fs.writeFileSync(nul, "// comment with a NUL marker \0\n" + line, "utf8");
  fs.writeFileSync(binExt, line, "utf8");
  const files = [plain, nul, binExt];

  const realScan = buildHelper(helperBody);
  const oldScan = buildHelper(helperMutated);
  const rel = (list) => list.map((l) => l.replace(tmp + path.sep, ""));
  const direct = realScan(files, TOKENS, (f) => BIN.has(path.extname(f).toLowerCase()), tmp);
  const directOld = oldScan(files, TOKENS, (f) => BIN.has(path.extname(f).toLowerCase()), tmp);
  const gateReal = buildGateWrapper(realScan)(files);
  const gateOld = buildGateWrapper(oldScan)(files);
  const advReal = buildAdvWrapper(realScan)(files);
  const advOld = buildAdvWrapper(oldScan)(files);
  const strip = (arr) => arr.map((h) => h.split(": ").pop() + "@" + path.basename(h.split(": ")[0]));
  console.log("PART B: the REAL shared helper and the REAL wrappers, in memory");
  console.log(
    JSON.stringify(
      {
        old_skip_mutation_applied_in_memory: mutationApplied,
        helper_current: { count: direct.length, hits: strip(rel(direct)) },
        helper_old_skip: { count: directOld.length, hits: strip(rel(directOld)) },
        gate_wrapper_with_current_helper: { count: gateReal.length, hits: strip(gateReal.map((h) => h.split(path.sep).pop())) },
        gate_wrapper_with_old_skip_helper: { count: gateOld.length },
        adversarial_wrapper_with_current_helper: { count: advReal.length },
        adversarial_wrapper_with_old_skip_helper: { count: advOld.length },
        note: "asset.png is skipped by extension in each run; nul.ts is a text source with a NUL in a comment",
      },
      null,
      1,
    ),
  );

  // Read-error behavior: a path that names a folder is unreadable as a file.
  const errFiles = [unreadable, plain];
  const errRun = realScan(errFiles, TOKENS, () => false, tmp);
  console.log("PART B2: read-error behavior of the shared helper (a folder named as a file)");
  console.log(JSON.stringify({ hit_count_for_folder_plus_plain: errRun.length, note: "the folder is skipped silently; plain.ts still reports" }, null, 1));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ---------- Part C ----------
const gateLines = gateSource.split("\n");
const advLines = advSource.split("\n");
const helperLines = helperSource.split("\n");
const num = (lines, re) =>
  lines
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => re.test(l))
    .map(([n, l]) => n + ": " + l.trim());
const regStart = advSource.indexOf('it("ADV-S4-1 NUL regression');
const regEnd = advSource.indexOf('it("ADV-S4-2 and ADV-S4-8');
const regBlock = advSource.slice(regStart, regEnd);
const callers = {};
for (const [name, lines] of [["gate", gateLines], ["adversarial", advLines], ["helper", helperLines]]) {
  callers[name] = num(lines, /scanFilesForBannedTokens/);
}
const contentTests = /\\0|\\x00|\\u0000|charCodeAt\(0\)|includes\(0\)|indexOf\(0\)|\.indexOf\("\\0"\)|isBinaryFile|istextorbinary|Buffer\./;
console.log("PART C: reference map");
console.log(
  JSON.stringify(
    {
      scanFilesForBannedTokens_lines: callers,
      dead_helper_findBannedTokensInText_in_scripts_tests: [
        ...num(gateLines, /findBannedTokensInText/).map((x) => "gate " + x),
        ...num(advLines, /findBannedTokensInText/).map((x) => "adversarial " + x),
        ...num(helperLines, /findBannedTokensInText/).map((x) => "helper " + x),
      ],
      nul_case_calls_shared_helper_directly: (regBlock.match(/scanFilesForBannedTokens\(/g) || []).length,
      nul_case_calls_adversarial_wrapper: (regBlock.match(/scanRepoFilesForBannedTokens\(/g) || []).length,
      real_repo_scan_test_calls_wrapper: /scanRepoFilesForBannedTokens\(files\)/.test(advSource),
      gate_wrapper_body: grab(gateSource, /function findBannedTokenMatches[\s\S]*?\n}\n/, "gate wrapper").trim(),
      adversarial_wrapper_body: grab(advSource, /function scanRepoFilesForBannedTokens[\s\S]*?\n}\n/, "adv wrapper").trim(),
      content_based_lines_in_helper: num(helperLines, contentTests),
      content_based_lines_in_gate: num(gateLines, contentTests),
      content_based_lines_in_adversarial: num(advLines, contentTests),
      helper_skip_and_continue_lines: num(helperLines, /continue;/),
      gate_skip_lines: num(gateLines, /continue;/),
      adversarial_skip_lines_outside_helper_use: num(advLines, /continue;/),
    },
    null,
    1,
  ),
);
