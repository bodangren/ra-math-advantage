// Phase S4 acceptance r2: sentence-length check of the prose that the S4 phase added to
// the four edited documents. Read-only. Lists every added sentence with its word count
// and flags a count over 25. Passive voice and idioms need a human read (done in the log).
const { execFileSync } = require("node:child_process");

const BASE = "8283f9fa192be2afc78a2e731fac1e267c3535b5";
const DOCS = [
  "apps/bus-math-v2/.env.example",
  "apps/integrated-math-3/.env.example",
  "apps/bus-math-v2/wrangler.jsonc",
  "apps/integrated-math-3/wrangler.jsonc",
  "measure/tech-stack.md",
];

let total = 0;
let over = 0;
const rows = [];
for (const doc of DOCS) {
  const diff = execFileSync("git", ["diff", "--unified=0", BASE + "..HEAD", "--", doc], { encoding: "utf8" });
  const added = diff
    .split("\n")
    .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
    .map((l) => l.slice(1));
  // Join consecutive prose lines of one paragraph so that a wrapped sentence counts once.
  const paragraphs = [];
  let cur = [];
  for (const raw of added) {
    const line = raw
      .replace(/^\s*(#|\/\/)\s?/, "")
      .replace(/^\s*[-*]\s+/, "")
      .trim();
    const isTable = line.startsWith("|");
    const isFence = line.startsWith("```");
    const isHeading = doc.endsWith(".md") && /^#{1,6}\s/.test(raw.trim());
    if (line === "" || isTable || isFence || isHeading) {
      if (cur.length) paragraphs.push(cur.join(" "));
      cur = [];
      continue;
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
      rows.push({ doc, words: words.length, flag, text: sentence.slice(0, 140) });
    }
  }
}
const longest = rows.slice().sort((a, b) => b.words - a.words).slice(0, 8);
console.log(JSON.stringify({ sentences_checked: total, sentences_over_25_words: over, longest_eight: longest }, null, 1));
