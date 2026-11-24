// Phase S4 acceptance r3: sentence-length check of the prose that the S4 phase added to
// plan.md and evidence.md (the five edited documents were checked by acceptance2-asd-check.cjs
// and have not changed since 89946220). Read-only. Flags a sentence over 25 words and lists
// passive-voice candidates for a human read. A sentence of code or a table row is skipped.
const { execFileSync } = require("node:child_process");

const BASE = process.argv[2] || "8283f9fa192be2afc78a2e731fac1e267c3535b5";
const DOCS = [
  "measure/tracks/openrouter-sdk-ai-layer_20261114/plan.md",
  "measure/tracks/openrouter-sdk-ai-layer_20261114/evidence.md",
];
const PASSIVE = /\b(is|are|was|were|be|been|being)\s+(\w+ly\s+)?(\w+ed|made|run|done|held|kept|set|shown|given|taken|written|read|found|seen|left|put|built|sent|used)\b/i;

let total = 0;
let over = 0;
const rows = [];
for (const doc of DOCS) {
  const diff = execFileSync("git", ["diff", "--unified=0", BASE + "..HEAD", "--", doc], { encoding: "utf8" });
  const added = diff
    .split("\n")
    .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
    .map((l) => l.slice(1));
  const paragraphs = [];
  let cur = [];
  for (const raw of added) {
    const line = raw
      .replace(/^\s*[-*]\s+(\[[ x~b]\]\s+)?/, "")
      .trim();
    const isTable = line.startsWith("|");
    const isFence = line.startsWith("```");
    const isHeading = /^#{1,6}\s/.test(raw.trim());
    const startsItem = /^\s*[-*]\s/.test(raw);
    if (line === "" || isTable || isFence || isHeading) {
      if (cur.length) paragraphs.push(cur.join(" "));
      cur = [];
      continue;
    }
    if (startsItem && cur.length) {
      paragraphs.push(cur.join(" "));
      cur = [];
    }
    cur.push(line);
  }
  if (cur.length) paragraphs.push(cur.join(" "));
  for (const p of paragraphs) {
    const cleaned = p.replace(/`[^`]*`/g, "CODE").replace(/https?:\/\/\S+/g, "URL");
    for (const sentence of cleaned.split(/(?<=[.!?])\s+/)) {
      const words = sentence.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w));
      if (words.length === 0) continue;
      total += 1;
      const flag = words.length > 25;
      if (flag) over += 1;
      rows.push({ doc: doc.split("/").pop(), words: words.length, flag, passive: PASSIVE.test(sentence), text: sentence.slice(0, 200) });
    }
  }
}
const longest = rows.slice().sort((a, b) => b.words - a.words).slice(0, 10);
console.log(JSON.stringify({ base: BASE, sentences_checked: total, sentences_over_25_words: over, longest_ten: longest }, null, 1));
console.log("passive candidates (read each):");
for (const r of rows.filter((x) => x.passive)) console.log("- [" + r.doc + ", " + r.words + " words] " + r.text);
