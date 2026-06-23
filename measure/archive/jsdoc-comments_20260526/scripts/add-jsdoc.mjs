#!/usr/bin/env node
/**
 * Adds JSDoc comments to functions in BM2 lib/ that are missing them.
 * Reads function metadata from graph.db, parses function signatures from source,
 * and inserts JSDoc blocks before each undocumented function.
 *
 * Usage: node measure/tracks/jsdoc-comments_20260526/scripts/add-jsdoc.mjs
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../../..");
const GRAPH_DB = resolve(REPO_ROOT, "graph.db");
const SCOPE = "%/apps/bus-math-v2/lib/%";

// Get all NULL functions from graph.db
const query = `SELECT file_path, name, line_start, tags FROM nodes WHERE type='function' AND file_path LIKE '${SCOPE}' AND summary IS NULL ORDER BY file_path, line_start`;
const raw = execSync(`build-graph query "${GRAPH_DB}" "${query}"`, {
  encoding: "utf-8",
  cwd: REPO_ROOT,
});

// Parse the table output (skip header lines)
const lines = raw.trim().split("\n");
const functions = [];
for (const line of lines) {
  if (line.startsWith("-") || line.startsWith("file_path") || line.trim() === "")
    continue;
  const parts = line.split("|").map((s) => s.trim());
  if (parts.length >= 3) {
    const [file_path, name, line_start_str, tags_str] = parts;
    functions.push({
      file_path,
      name,
      line_start: parseInt(line_start_str, 10),
      is_exported: tags_str?.includes("exported") ?? false,
    });
  }
}

console.log(`Found ${functions.length} functions needing JSDoc`);

// Group by file
const byFile = {};
for (const fn of functions) {
  if (!byFile[fn.file_path]) byFile[fn.file_path] = [];
  byFile[fn.file_path].push(fn);
}

const fileCount = Object.keys(byFile).length;
console.log(`Across ${fileCount} files`);

// Generate a JSDoc comment for a function based on its name and signature
function generateJSDoc(fn, sourceLines) {
  // Find the actual function line - search around the reported line
  let funcLine = "";
  let funcLineIdx = -1;
  for (
    let i = Math.max(0, fn.line_start - 3);
    i < Math.min(sourceLines.length, fn.line_start + 5);
    i++
  ) {
    const line = sourceLines[i];
    if (
      line.includes(`function ${fn.name}`) ||
      line.includes(`const ${fn.name} =`) ||
      line.includes(`let ${fn.name} =`)
    ) {
      funcLine = line;
      funcLineIdx = i;
      break;
    }
  }

  if (funcLineIdx === -1) return null;

  // Check if there's already a JSDoc comment above
  let checkIdx = funcLineIdx - 1;
  while (checkIdx >= 0 && sourceLines[checkIdx].trim() === "") checkIdx--;
  if (
    checkIdx >= 0 &&
    (sourceLines[checkIdx].trim().endsWith("*/") ||
      sourceLines[checkIdx].trim().startsWith("*") ||
      sourceLines[checkIdx].trim().startsWith("/**"))
  ) {
    return null; // Already has JSDoc
  }

  // Parse parameters from the function signature
  let fullSig = funcLine;
  // Handle multi-line signatures by collecting until we find the closing paren
  let parenDepth = 0;
  let sigStart = funcLineIdx;
  for (let i = funcLineIdx; i < Math.min(sourceLines.length, funcLineIdx + 10); i++) {
    for (const ch of sourceLines[i]) {
      if (ch === "(") parenDepth++;
      if (ch === ")") parenDepth--;
    }
    if (i > funcLineIdx) fullSig += " " + sourceLines[i].trim();
    if (parenDepth === 0) break;
  }

  // Extract parameters
  const paramMatch = fullSig.match(/\(([^)]*)\)/s);
  const params = [];
  if (paramMatch && paramMatch[1].trim()) {
    const paramStr = paramMatch[1];
    // Split by comma, handling nested generics and destructuring
    let depth = 0;
    let current = "";
    for (const ch of paramStr) {
      if (ch === "<" || ch === "{" || ch === "[") depth++;
      if (ch === ">" || ch === "}" || ch === "]") depth--;
      if (ch === "," && depth === 0) {
        params.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    if (current.trim()) params.push(current.trim());
  }

  // Clean up param names
  const paramDocs = params
    .map((p) => {
      // Handle destructuring: { a, b }: Type
      const destructureMatch = p.match(/^\{[^}]+\}\s*:?\s*(.*)/);
      if (destructureMatch) {
        return { name: "options", type: destructureMatch[1] || "" };
      }
      // Handle rest params: ...args: Type
      const restMatch = p.match(/^\.\.\.(\w+)\s*:?\s*(.*)/);
      if (restMatch) {
        return { name: restMatch[1], type: restMatch[2] || "" };
      }
      // Handle regular: name: Type or name?: Type
      const regularMatch = p.match(/^(\w+)\??\s*:?\s*(.*)/);
      if (regularMatch) {
        return { name: regularMatch[1], type: regularMatch[2] || "" };
      }
      return { name: p.replace(/[^a-zA-Z0-9_]/g, ""), type: "" };
    })
    .filter((p) => p.name && p.name !== "");

  // Check return type
  const returnMatch = fullSig.match(/\)\s*:\s*([^{]+)/);
  const returnType = returnMatch ? returnMatch[1].trim() : "";

  // Generate summary from function name
  const summary = nameToSummary(fn.name);

  // Build JSDoc lines
  const docLines = ["/**", ` * ${summary}`];

  for (const p of paramDocs) {
    if (p.name === "options") {
      docLines.push(` * @param options - Configuration options`);
    } else {
      docLines.push(` * @param ${p.name} - ${paramToDescription(p.name)}`);
    }
  }

  if (returnType && returnType !== "void") {
    docLines.push(` * @returns ${returnToDescription(fn.name, returnType)}`);
  }

  docLines.push(" */");

  return { lineIdx: funcLineIdx, docLines };
}

function nameToSummary(name) {
  // Convert camelCase/PascalCase to sentence
  const words = name
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim()
    .split(/\s+/);

  // Capitalize first word
  if (words.length > 0) {
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }

  // Common verb patterns
  const verbMap = {
    build: "Builds",
    create: "Creates",
    get: "Gets",
    set: "Sets",
    fetch: "Fetches",
    load: "Loads",
    save: "Saves",
    delete: "Deletes",
    remove: "Removes",
    add: "Adds",
    update: "Updates",
    check: "Checks",
    validate: "Validates",
    verify: "Verifies",
    resolve: "Resolves",
    format: "Formats",
    parse: "Parses",
    compute: "Computes",
    calculate: "Calculates",
    generate: "Generates",
    find: "Finds",
    filter: "Filters",
    sort: "Sorts",
    map: "Maps",
    reduce: "Reduces",
    transform: "Transforms",
    convert: "Converts",
    extract: "Extracts",
    handle: "Handles",
    process: "Processes",
    render: "Renders",
    display: "Displays",
    show: "Shows",
    hide: "Hides",
    toggle: "Toggles",
    init: "Initializes",
    setup: "Sets up",
    reset: "Resets",
    clear: "Clears",
    merge: "Merges",
    split: "Splits",
    join: "Joins",
    combine: "Combines",
    clone: "Clones",
    copy: "Copies",
    move: "Moves",
    pick: "Picks",
    shuffle: "Shuffles",
    clamp: "Clamps",
    round: "Rounds",
    normalize: "Normalizes",
    sanitize: "Sanitizes",
    hash: "Hashes",
    encrypt: "Encrypts",
    decrypt: "Decrypts",
    is: "Checks if",
    has: "Checks if",
    can: "Checks if",
    should: "Checks if",
    will: "Checks if",
    does: "Checks if",
    was: "Checks if",
    are: "Checks if",
    list: "Lists",
    count: "Counts",
    sum: "Sums",
    average: "Averages",
    min: "Gets minimum of",
    max: "Gets maximum of",
    describe: "Describes",
    explain: "Exercises",
    assemble: "Assembles",
    derive: "Derives",
    enrich: "Enriches",
    score: "Scores",
    select: "Selects",
    assign: "Assigns",
    prioritize: "Prioritizes",
    apply: "Applies",
    intervene: "Intervenes",
    slugify: "Slugifies",
    trigger: "Triggers",
    hashIp: "Hashes",
    call: "Calls",
  };

  const firstWord = words[0].toLowerCase();
  if (verbMap[firstWord]) {
    words[0] = verbMap[firstWord];
    return words.join(" ");
  }

  // Default: just capitalize and add context
  return words.join(" ") + ".";
}

function paramToDescription(name) {
  const descs = {
    ip: "IP address",
    unitNumber: "Unit number",
    lessonNumber: "Lesson number",
    title: "Title text",
    value: "Input value",
    data: "Input data",
    input: "Input value",
    options: "Configuration options",
    config: "Configuration",
    callback: "Callback function",
    fn: "Function to execute",
    predicate: "Predicate function",
    acc: "Accumulator",
    index: "Index position",
    i: "Index position",
    key: "Key identifier",
    id: "Identifier",
    name: "Name string",
    type: "Type identifier",
    label: "Display label",
    text: "Text content",
    message: "Message string",
    error: "Error object",
    result: "Result value",
    response: "Response data",
    request: "Request data",
    url: "URL string",
    path: "File path",
    dir: "Directory path",
    file: "File path",
    source: "Source value",
    target: "Target value",
    destination: "Destination value",
    items: "Collection of items",
    list: "List of values",
    array: "Array of values",
    map: "Map of values",
    set: "Set of values",
    record: "Record of values",
    entries: "Entries to process",
    rows: "Rows of data",
    columns: "Column definitions",
    headers: "Header definitions",
    schema: "Schema definition",
    validator: "Validator function",
    context: "Context object",
    env: "Environment configuration",
    state: "Current state",
    props: "Properties object",
    children: "Child elements",
    parent: "Parent element",
    node: "Node element",
    element: "DOM element",
    event: "Event object",
    handler: "Event handler",
    action: "Action to perform",
    operation: "Operation to execute",
    query: "Query string or object",
    mutation: "Mutation to apply",
    params: "Parameters object",
    args: "Arguments",
    rest: "Remaining arguments",
    seed: "Random seed",
    min: "Minimum value",
    max: "Maximum value",
    offset: "Offset value",
    limit: "Limit value",
    count: "Count value",
    size: "Size value",
    length: "Length value",
    width: "Width value",
    height: "Height value",
    duration: "Duration value",
    delay: "Delay value",
    timeout: "Timeout value",
    interval: "Interval value",
    threshold: "Threshold value",
    tolerance: "Tolerance value",
    precision: "Precision value",
    accuracy: "Accuracy value",
    factor: "Factor value",
    ratio: "Ratio value",
    rate: "Rate value",
    amount: "Amount value",
    total: "Total value",
    subtotal: "Subtotal value",
    balance: "Balance value",
    quantity: "Quantity value",
    price: "Price value",
    cost: "Cost value",
    revenue: "Revenue value",
    expense: "Expense value",
    profit: "Profit value",
    loss: "Loss value",
    income: "Income value",
    asset: "Asset value",
    liability: "Liability value",
    equity: "Equity value",
    account: "Account identifier",
    accountName: "Account name",
    accountType: "Account type",
    category: "Category identifier",
    tag: "Tag identifier",
    filter: "Filter criteria",
    sort: "Sort criteria",
    order: "Order direction",
    direction: "Direction value",
    mode: "Mode identifier",
    format: "Format string",
    pattern: "Pattern string",
    template: "Template string",
    locale: "Locale identifier",
    timezone: "Timezone identifier",
    date: "Date value",
    time: "Time value",
    timestamp: "Timestamp value",
    startDate: "Start date",
    endDate: "End date",
    createdAt: "Creation timestamp",
    updatedAt: "Update timestamp",
    userId: "User identifier",
    studentId: "Student identifier",
    teacherId: "Teacher identifier",
    classId: "Class identifier",
    schoolId: "School identifier",
    lessonId: "Lesson identifier",
    phaseId: "Phase identifier",
    activityId: "Activity identifier",
    submissionId: "Submission identifier",
    progressId: "Progress identifier",
    sessionId: "Session identifier",
    token: "Authentication token",
    password: "Password string",
    email: "Email address",
    role: "Role identifier",
    permission: "Permission identifier",
    status: "Status value",
    flags: "Feature flags",
    metadata: "Metadata object",
    options: "Options object",
    settings: "Settings object",
    preferences: "Preferences object",
    config: "Configuration object",
    params: "Parameters object",
    context: "Context object",
    scope: "Scope identifier",
    prefix: "Prefix string",
    suffix: "Suffix string",
    separator: "Separator character",
    delimiter: "Delimiter character",
    padding: "Padding value",
    alignment: "Alignment direction",
    justification: "Justification type",
    comparison: "Comparison operator",
    operator: "Operator type",
    operand: "Operand value",
    expression: "Expression string",
    statement: "Statement string",
    block: "Block string",
    scope: "Scope identifier",
    depth: "Depth level",
    level: "Level value",
    rank: "Rank value",
    priority: "Priority value",
    weight: "Weight value",
    score: "Score value",
    grade: "Grade value",
    mark: "Mark value",
    point: "Point value",
    line: "Line identifier",
    row: "Row identifier",
    col: "Column identifier",
    column: "Column identifier",
    cell: "Cell identifier",
    range: "Range value",
    selection: "Selection value",
    cursor: "Cursor position",
    caret: "Caret position",
    highlight: "Highlight value",
    focus: "Focus value",
    blur: "Blur value",
    scroll: "Scroll position",
    zoom: "Zoom level",
    rotation: "Rotation angle",
    scale: "Scale factor",
    translation: "Translation offset",
    velocity: "Velocity value",
    acceleration: "Acceleration value",
    force: "Force value",
    mass: "Mass value",
    density: "Density value",
    volume: "Volume value",
    area: "Area value",
    perimeter: "Perimeter value",
    radius: "Radius value",
    diameter: "Diameter value",
    circumference: "Circumference value",
    angle: "Angle value",
    slope: "Slope value",
    intercept: "Intercept value",
    coefficient: "Coefficient value",
    constant: "Constant value",
    variable: "Variable value",
    parameter: "Parameter value",
    argument: "Argument value",
    return: "Return value",
    result: "Result value",
    output: "Output value",
    input: "Input value",
    buffer: "Buffer value",
    stream: "Stream value",
    channel: "Channel value",
    port: "Port number",
    host: "Host address",
    domain: "Domain name",
    subdomain: "Subdomain name",
    protocol: "Protocol type",
    method: "Method name",
    header: "Header value",
    body: "Body content",
    payload: "Payload data",
    content: "Content data",
    data: "Data value",
    info: "Info object",
    detail: "Detail object",
    summary: "Summary text",
    description: "Description text",
    comment: "Comment text",
    note: "Note text",
    warning: "Warning text",
    error: "Error message",
    success: "Success flag",
    failure: "Failure flag",
    pending: "Pending flag",
    complete: "Complete flag",
    partial: "Partial flag",
    empty: "Empty flag",
    full: "Full flag",
    valid: "Valid flag",
    invalid: "Invalid flag",
    active: "Active flag",
    inactive: "Inactive flag",
    enabled: "Enabled flag",
    disabled: "Disabled flag",
    visible: "Visible flag",
    hidden: "Hidden flag",
    expanded: "Expanded flag",
    collapsed: "Collapsed flag",
    open: "Open flag",
    closed: "Closed flag",
    locked: "Locked flag",
    unlocked: "Unlocked flag",
    readonly: "Read-only flag",
    editable: "Editable flag",
    required: "Required flag",
    optional: "Optional flag",
    nullable: "Nullable flag",
    undefined: "Undefined flag",
    boolean: "Boolean flag",
    string: "String value",
    number: "Numeric value",
    bigint: "BigInt value",
    symbol: "Symbol value",
    object: "Object value",
    array: "Array value",
    function: "Function value",
    date: "Date value",
    regexp: "RegExp value",
    error: "Error value",
    promise: "Promise value",
    map: "Map value",
    set: "Set value",
    weakmap: "WeakMap value",
    weakset: "WeakSet value",
    arraybuffer: "ArrayBuffer value",
    dataview: "DataView value",
    float32array: "Float32Array value",
    float64array: "Float64Array value",
    int8array: "Int8Array value",
    int16array: "Int16Array value",
    int32array: "Int32Array value",
    uint8array: "Uint8Array value",
    uint16array: "Uint16Array value",
    uint32array: "Uint32Array value",
    uint8clampedarray: "Uint8ClampedArray value",
  };

  return descs[name] || name.replace(/([A-Z])/g, " $1").toLowerCase();
}

function returnToDescription(name, returnType) {
  if (name.startsWith("is") || name.startsWith("has") || name.startsWith("can"))
    return "True if the condition is met";
  if (name.startsWith("get")) return "The requested value";
  if (name.startsWith("build") || name.startsWith("create"))
    return "The constructed result";
  if (name.startsWith("format")) return "Formatted string";
  if (name.startsWith("parse")) return "Parsed result";
  if (name.startsWith("compute") || name.startsWith("calculate"))
    return "Computed result";
  if (name.startsWith("generate")) return "Generated result";
  if (name.startsWith("find")) return "Found result or undefined";
  if (name.startsWith("filter")) return "Filtered collection";
  if (name.startsWith("map")) return "Mapped collection";
  if (name.startsWith("resolve")) return "Resolved value";
  if (name.startsWith("convert") || name.startsWith("transform"))
    return "Transformed value";
  if (name.startsWith("validate") || name.startsWith("verify"))
    return "Validation result";
  if (returnType.includes("[]")) return "Array of results";
  if (returnType.includes("Promise")) return "Promise resolving to the result";
  return "Function result";
}

// Process each file
let totalAdded = 0;
let totalSkipped = 0;

for (const [filePath, fns] of Object.entries(byFile)) {
  const content = readFileSync(filePath, "utf-8");
  const sourceLines = content.split("\n");

  // Find all JSDoc insertion points
  const insertions = [];
  for (const fn of fns) {
    const result = generateJSDoc(fn, sourceLines);
    if (result) {
      insertions.push(result);
    } else {
      totalSkipped++;
    }
  }

  if (insertions.length === 0) continue;

  // Sort by line index descending so we can insert from bottom to top
  insertions.sort((a, b) => b.lineIdx - a.lineIdx);

  // Get indentation of the function line
  for (const ins of insertions) {
    const funcLine = sourceLines[ins.lineIdx];
    const indent = funcLine.match(/^(\s*)/)[1];

    // Add indentation to doc lines
    const docBlock = ins.docLines.map((l) =>
      l === "/**" || l === " */" ? indent + l : indent + l
    );

    // Insert blank line before JSDoc if previous line is not blank
    const prevLine = sourceLines[ins.lineIdx - 1]?.trim();
    if (prevLine && prevLine !== "" && !prevLine.endsWith("*/")) {
      docBlock.unshift("");
    }

    sourceLines.splice(ins.lineIdx, 0, ...docBlock);
    totalAdded++;
  }

  writeFileSync(filePath, sourceLines.join("\n"));
  console.log(`  ${filePath}: added ${insertions.length} JSDoc blocks`);
}

console.log(`\nDone: ${totalAdded} JSDoc blocks added, ${totalSkipped} skipped (already had JSDoc or not found)`);
