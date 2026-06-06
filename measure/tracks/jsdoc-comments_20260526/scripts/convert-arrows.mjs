#!/usr/bin/env node
/**
 * Converts const arrow functions to regular function declarations.
 * Uses a two-pass approach: first collect full text, then parse and convert.
 */
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const GRAPH_DB = "./graph.db";
const query = `SELECT file_path, name, line_start, tags FROM nodes WHERE type='function' AND file_path LIKE '%/apps/bus-math-v2/components/%' AND summary IS NULL ORDER BY file_path, line_start`;
const raw = execSync(`build-graph query "${GRAPH_DB}" "${query}"`, { encoding: "utf-8" });

const funcs = [];
for (const line of raw.trim().split("\n")) {
  if (line.startsWith("-") || line.startsWith("file_path") || line.trim() === "") continue;
  const parts = line.split("|").map((s) => s.trim());
  if (parts.length >= 3) {
    funcs.push({
      file_path: parts[0],
      name: parts[1],
      line_start: parseInt(parts[2], 10),
      is_exported: parts[3]?.includes("exported") ?? false,
    });
  }
}

console.log(`Found ${funcs.length} functions to convert`);

const byFile = {};
for (const fn of funcs) {
  if (!byFile[fn.file_path]) byFile[fn.file_path] = [];
  byFile[fn.file_path].push(fn);
}

function findConstLineIdx(lines, name, reported) {
  for (let i = Math.max(0, reported - 5); i < Math.min(lines.length, reported + 10); i++) {
    if (lines[i].match(new RegExp(`^(export\\s+)?const\\s+${name}\\s*[:=<]`))) return i;
  }
  return -1;
}

function findJsdocStart(lines, beforeIdx) {
  let i = beforeIdx - 1;
  while (i >= 0 && lines[i].trim() === "") i--;
  if (i >= 0 && (lines[i].trim().endsWith("*/") || lines[i].trim().startsWith("*"))) {
    for (let j = i; j >= 0; j--) {
      if (lines[j].trim().startsWith("/**")) return j;
    }
  }
  return -1;
}

/**
 * Find the assignment = sign in a const declaration.
 * Walks character by character, tracking paren/angle depth.
 * Skips over the variable name and optional type annotation.
 */
function findAssignmentEquals(lines, startIdx) {
  let depth = 0; // paren + brace + bracket depth
  let angleDepth = 0;
  let pastName = false;
  let parenSeen = false;

  for (let i = startIdx; i < Math.min(lines.length, startIdx + 20); i++) {
    const line = lines[i];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      const next = line[c + 1];

      if (ch === "(" || ch === "{" || ch === "[") depth++;
      if (ch === ")" || ch === "}" || ch === "]") depth = Math.max(0, depth - 1);
      if (ch === "<" && depth === 0) angleDepth++;
      if (ch === ">" && angleDepth > 0) angleDepth--;

      // After the const name, we look for the assignment =
      // The assignment = comes after the name (and optional type annotation)
      // and is NOT part of ==, ===, !=, !==, <=, >=, =>
      if (ch === "=" && depth === 0 && angleDepth === 0) {
        if (next === "=" || next === ">") continue; // == or =>
        if (c > 0 && (line[c - 1] === "!" || line[c - 1] === "<" || line[c - 1] === ">")) continue;
        // This is the assignment =
        return { lineIdx: i, colIdx: c };
      }
    }
  }
  return null;
}

/**
 * Find the => arrow after the assignment = sign.
 */
function findArrow(lines, startLine, startCol) {
  let depth = 0;
  for (let i = startLine; i < Math.min(lines.length, startLine + 20); i++) {
    const line = lines[i];
    const startC = i === startLine ? startCol + 1 : 0;
    for (let c = startC; c < line.length; c++) {
      const ch = line[c];
      if (ch === "(" || ch === "{" || ch === "[") depth++;
      if (ch === ")" || ch === "}" || ch === "]") depth = Math.max(0, depth - 1);
      if (ch === "=" && line[c + 1] === ">") {
        return { lineIdx: i, colIdx: c };
      }
    }
  }
  return null;
}

/**
 * Find the end of the arrow function body.
 * If body starts with {, find matching }.
 * Otherwise, find the end of the expression (semicolon or end of line).
 */
function findBodyEnd(lines, arrowLine, arrowCol) {
  const afterArrow = lines[arrowLine].substring(arrowCol + 2).trim();

  if (!afterArrow.startsWith("{")) {
    // Single expression body
    // Find end: look for semicolon at end, or just use rest of line
    let endLine = arrowLine;
    let expr = afterArrow;
    // If expression spans multiple lines (unlikely but possible), collect
    if (!expr.endsWith(";") && !expr.endsWith("}") && arrowLine + 1 < lines.length) {
      // Check if next line continues the expression
      const nextLine = lines[arrowLine + 1]?.trim();
      if (nextLine && !nextLine.startsWith("//") && !nextLine.startsWith("export") && !nextLine.startsWith("const") && !nextLine.startsWith("function") && !nextLine.startsWith("interface") && !nextLine.startsWith("type") && !nextLine.startsWith("import")) {
        // Might be continuation
      }
    }
    return { endLine: arrowLine, isSingleExpr: true, expr: expr.replace(/;\s*$/, "") };
  }

  // Multi-line body with braces
  let depth = 0;
  for (let i = arrowLine; i < Math.min(lines.length, arrowLine + 500); i++) {
    const line = lines[i];
    const startC = i === arrowLine ? lines[arrowLine].indexOf("{", arrowCol) : 0;
    for (let c = startC; c < line.length; c++) {
      if (line[c] === "{") depth++;
      if (line[c] === "}") {
        depth--;
        if (depth === 0) {
          return { endLine: i, isSingleExpr: false };
        }
      }
    }
  }
  return null;
}

let totalConverted = 0;
let totalSkipped = 0;

for (const [filePath, fns] of Object.entries(byFile)) {
  const content = readFileSync(filePath, "utf-8");
  const sourceLines = content.split("\n");
  let modified = false;

  // Process from bottom to top to preserve line numbers
  const sorted = [...fns].sort((a, b) => b.line_start - a.line_start);

  for (const fn of sorted) {
    const constIdx = findConstLineIdx(sourceLines, fn.name, fn.line_start);
    if (constIdx < 0) {
      console.log(`  SKIP: ${filePath}:${fn.name} - const not found`);
      totalSkipped++;
      continue;
    }

    const constLine = sourceLines[constIdx];
    const indent = constLine.match(/^(\s*)/)[1];
    const isExported = constLine.trimStart().startsWith("export ");
    const jsdocStart = findJsdocStart(sourceLines, constIdx);

    // Find assignment =
    const eqPos = findAssignmentEquals(sourceLines, constIdx);
    if (!eqPos) {
      console.log(`  SKIP: ${filePath}:${fn.name} - = not found`);
      totalSkipped++;
      continue;
    }

    // Find arrow =>
    const arrowPos = findArrow(sourceLines, eqPos.lineIdx, eqPos.colIdx);
    if (!arrowPos) {
      console.log(`  SKIP: ${filePath}:${fn.name} - => not found`);
      totalSkipped++;
      continue;
    }

    // Extract the part between const name and =
    // This is: [export] const name[<generic>][<type annotation>]
    let declPart = "";
    for (let i = constIdx; i <= eqPos.lineIdx; i++) {
      const line = sourceLines[i];
      const endC = i === eqPos.lineIdx ? eqPos.colIdx : line.length;
      declPart += (i > constIdx ? " " : "") + line.substring(0, endC);
    }
    declPart = declPart.replace(/\s+/g, " ").trim();

    // Parse: [export] const name[<generic>][(params)][(: ReturnType)]
    // We need to split at the = sign, so declPart is everything before =
    // The part after = and before => is the params and return type

    // Extract params: they're between the last ( and ) before =>
    let paramsPart = "";
    for (let i = eqPos.lineIdx; i <= arrowPos.lineIdx; i++) {
      const line = sourceLines[i];
      const startC = i === eqPos.lineIdx ? eqPos.colIdx + 1 : 0;
      const endC = i === arrowPos.lineIdx ? arrowPos.colIdx : line.length;
      paramsPart += (i > eqPos.lineIdx ? " " : "") + line.substring(startC, endC);
    }
    paramsPart = paramsPart.replace(/\s+/g, " ").trim();

    // Extract async keyword if present
    const asyncMatch = paramsPart.match(/^async\s+/);
    const asyncKw = asyncMatch ? "async " : "";
    if (asyncMatch) paramsPart = paramsPart.substring(asyncMatch[0].length);

    // Extract return type annotation if present (after the closing paren of params)
    // The paramsPart should be like "(params): ReturnType" or just "(params)"
    const lastParen = paramsPart.lastIndexOf(")");
    let returnType = "";
    let params = paramsPart;
    if (lastParen >= 0 && lastParen < paramsPart.length - 1) {
      const afterParen = paramsPart.substring(lastParen + 1).trim();
      if (afterParen.startsWith(":")) {
        returnType = " " + afterParen.trim();
        params = paramsPart.substring(0, lastParen + 1);
      }
    }

    // Extract function name and generic from declPart
    const nameMatch = declPart.match(/^(export\s+)?const\s+(\w+)(.*)/);
    if (!nameMatch) {
      console.log(`  SKIP: ${filePath}:${fn.name} - name not found in: ${declPart}`);
      totalSkipped++;
      continue;
    }
    const exportKw = nameMatch[1] || "";
    const funcName = nameMatch[2];
    const restOfDecl = nameMatch[3].trim();

    // restOfDecl might contain a type annotation like ": React.FC<Props>"
    // or generic like "<T,>" or nothing
    let generic = "";
    let typeAnnotation = "";
    if (restOfDecl.startsWith("<")) {
      // Generic
      const closeAngle = restOfDecl.indexOf(">");
      if (closeAngle >= 0) {
        generic = restOfDecl.substring(0, closeAngle + 1);
        typeAnnotation = restOfDecl.substring(closeAngle + 1).trim();
        if (typeAnnotation.startsWith(":")) typeAnnotation = typeAnnotation.substring(1).trim();
      }
    } else if (restOfDecl.startsWith(":")) {
      typeAnnotation = restOfDecl.substring(1).trim();
    }

    // Find body end
    const bodyEnd = findBodyEnd(sourceLines, arrowPos.lineIdx, arrowPos.colIdx);
    if (!bodyEnd) {
      console.log(`  SKIP: ${filePath}:${fn.name} - body end not found`);
      totalSkipped++;
      continue;
    }

    // Build the function declaration
    const funcDeclLine = `${indent}${exportKw}${asyncKw}function ${funcName}${generic}${params}${returnType} {`;

    // Build replacement lines
    const replacement = [];
    if (jsdocStart >= 0) {
      for (let j = jsdocStart; j < constIdx; j++) {
        replacement.push(sourceLines[j]);
      }
    }
    replacement.push(funcDeclLine);

    if (bodyEnd.isSingleExpr) {
      replacement.push(`${indent}  return ${bodyEnd.expr};`);
    } else {
      // Collect body lines between { and }
      const bodyStartLine = sourceLines[arrowPos.lineIdx];
      const braceIdx = bodyStartLine.indexOf("{", arrowPos.colIdx);
      const afterBrace = bodyStartLine.substring(braceIdx + 1).trim();

      if (afterBrace && afterBrace !== "}") {
        replacement.push(`${indent}  ${afterBrace}`);
      }

      for (let i = arrowPos.lineIdx + 1; i < bodyEnd.endLine; i++) {
        replacement.push(sourceLines[i]);
      }

      // Last line - everything before the closing }
      const lastLine = sourceLines[bodyEnd.endLine];
      const closeBraceIdx = lastLine.lastIndexOf("}");
      const beforeClose = lastLine.substring(0, closeBraceIdx).trim();
      if (beforeClose) {
        replacement.push(beforeClose);
      }
    }
    replacement.push(`${indent}}`);

    // Remove old lines and insert new
    const removeStart = jsdocStart >= 0 ? jsdocStart : constIdx;
    sourceLines.splice(removeStart, bodyEnd.endLine - removeStart + 1, ...replacement);
    modified = true;
    totalConverted++;
    console.log(`  CONVERT: ${filePath}:${fn.name}`);
  }

  if (modified) {
    writeFileSync(filePath, sourceLines.join("\n"));
  }
}

console.log(`\nDone: ${totalConverted} converted, ${totalSkipped} skipped`);
