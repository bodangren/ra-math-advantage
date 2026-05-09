// Curriculum markdown parsers for skill inventory extraction.
//
// All parsers are pure functions that take markdown strings and return
// structured extraction results. No filesystem or app imports.

// ---------------------------------------------------------------------------
// Extracted data types
// ---------------------------------------------------------------------------

export interface ExtractedObjective {
  code: string;
  description: string;
}

export interface ExtractedWorkedExample {
  lessonRef: string;
  exampleNumbers: number[];
  title?: string;
  rawText: string;
  lineNumber?: number;
  bodyExcerpt?: string;
}

export interface ExtractedLesson {
  lessonRef: string; // e.g., "1-1"
  moduleNumber: number;
  lessonNumber: number;
  objectives: ExtractedObjective[];
  examples: ExtractedWorkedExample[];
}

export interface ClassPeriodPlanExtract {
  moduleNumber: number;
  lessons: ExtractedLesson[];
  examples: ExtractedWorkedExample[];
}

export interface ModuleOverviewLesson {
  number: number;
  lessonNumber: number;
  title: string;
  description: string;
}

export interface ModuleOverviewExtract {
  moduleNumber: number;
  title: string;
  description: string;
  lessons: ModuleOverviewLesson[];
  skills: string[];
}

export interface ProblemFamilyEntry {
  familyKey: string;
  module: number;
  objectives: string[];
  sourceExamples: string;
  interactionShape: string;
  status: string;
  notes: string;
}

export interface AleksRegistryExtract {
  families: ProblemFamilyEntry[];
}

export interface RevealExample {
  index: number;
  title: string;
  lineNumber: number;
  bodyExcerpt: string;
}

export interface RevealLesson {
  lessonRef: string;
  examples: RevealExample[];
}

export interface RevealLessonSourceExtract {
  lessons: RevealLesson[];
}

export interface PrecalcExample {
  index: number;
  content: string;
  lineNumber: number;
}

export interface PrecalcLessonExtract {
  title: string;
  unit: number;
  topic: string;
  lessonRef: string;
  examples: PrecalcExample[];
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function parseMarkdownTable(text: string): Record<string, string>[] {
  const lines = text.split('\n');
  const rows: Record<string, string>[] = [];

  let headers: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect table header/split row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---') && headers.length > 0) {
        // separator row: skip
        continue;
      }

      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      if (headers.length === 0) {
        headers = cells;
        inTable = true;
      } else {
        const row: Record<string, string> = {};
        for (let i = 0; i < headers.length && i < cells.length; i++) {
          row[headers[i]] = cells[i];
        }
        rows.push(row);
      }
    } else if (inTable && !trimmed.startsWith('|')) {
      // End of table
      break;
    }
  }

  return rows;
}

function parseRange(rangeStr: string): number[] {
  // e.g., "1-3" → [1, 2, 3], "5" → [5]
  const match = rangeStr.match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return [];
  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : start;
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

function parseWorkedExamplesCell(cell: string): ExtractedWorkedExample[] {
  // "1-1, Examples 1-3 — Title One; Title Two; Title Three"
  if (!cell || cell === '—' || cell === '-') return [];

  const examples: ExtractedWorkedExample[] = [];
  // Split on " — " to separate the range from the titles
  const dashIndex = cell.indexOf(' — ');
  const rangePart = dashIndex >= 0 ? cell.slice(0, dashIndex).trim() : cell.trim();
  const titlePart = dashIndex >= 0 ? cell.slice(dashIndex + 3).trim() : '';
  const titles = titlePart
    ? titlePart.split(';').map((t) => t.trim()).filter(Boolean)
    : [];

  // Parse "1-1, Examples 1-3" → lessonRef + example numbers
  const rangeMatch = rangePart.match(
    /^(\d+-\d+),\s*Examples?\s+([\d,\s-]+)$/i,
  );
  if (!rangeMatch) return [];

  const lessonRef = rangeMatch[1];
  // Parse comma-separated ranges like "1-3" or "4, 5-7"
  const numParts = rangeMatch[2]
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const allNumbers: number[] = [];
  for (const part of numParts) {
    allNumbers.push(...parseRange(part));
  }

  // Always produce a single grouped entry for the entire cell
  examples.push({
    lessonRef,
    exampleNumbers: allNumbers,
    title: titles.join('; ') || undefined,
    rawText: cell,
  });

  return examples;
}

function parseObjectiveCell(cell: string): ExtractedObjective | null {
  // "1a. Graph quadratic functions."
  const match = cell.match(/^([\d]+[a-z]+)\.\s*(.+)$/i);
  if (!match) return null;
  return { code: match[1], description: match[2].replace(/\.$/, '') };
}

function parseEmbeddedObjectivesCell(
  cell: string,
): ExtractedObjective[] {
  // "1c, 1g" or "—" or "-"
  if (!cell || cell === '—' || cell === '-') return [];
  return cell
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .map((code) => ({ code, description: '' }));
}

function parseLessonRef(
  ref: string,
): { moduleNumber: number; lessonNumber: number } | null {
  const match = ref.match(/^(\d+)-(\d+)$/);
  if (!match) return null;
  return {
    moduleNumber: parseInt(match[1], 10),
    lessonNumber: parseInt(match[2], 10),
  };
}

// ---------------------------------------------------------------------------
// parseClassPeriodPlan
// ---------------------------------------------------------------------------

export function parseClassPeriodPlan(markdown: string): ClassPeriodPlanExtract {
  const rows = parseMarkdownTable(markdown);
  const lessonsMap = new Map<string, ExtractedLesson>();
  const allExamples: ExtractedWorkedExample[] = [];
  let moduleNumber = 1;

  for (const row of rows) {
    const dayType = row['Day Type'] || '';
    // Only process instruction rows
    if (dayType !== 'instruction' && dayType !== '`instruction`') continue;

    const lessonRef = (row['Source Textbook Lesson'] || '')
      .replace(/`/g, '')
      .trim();
    if (!lessonRef || lessonRef === '—') continue;

    const parsed = parseLessonRef(lessonRef);
    if (!parsed) continue;
    moduleNumber = parsed.moduleNumber;

    // Deduplicated lesson
    let lesson = lessonsMap.get(lessonRef);
    if (!lesson) {
      lesson = {
        lessonRef,
        moduleNumber: parsed.moduleNumber,
        lessonNumber: parsed.lessonNumber,
        objectives: [],
        examples: [],
      };
      lessonsMap.set(lessonRef, lesson);
    }

    // Primary objective
    const primaryText = (row['Primary Objective'] || '')
      .replace(/`/g, '')
      .trim();
    const primary = parseObjectiveCell(primaryText);
    if (primary && !lesson.objectives.some((o) => o.code === primary.code)) {
      lesson.objectives.push(primary);
    }

    // Embedded objectives
    const embeddedText = (row['Embedded Objectives'] || '').replace(/`/g, '').trim();
    const embedded = parseEmbeddedObjectivesCell(embeddedText);
    for (const obj of embedded) {
      if (!lesson.objectives.some((o) => o.code === obj.code)) {
        lesson.objectives.push(obj);
      }
    }

    // Worked examples
    const workedExamplesCell = (row['Worked Examples'] || '')
      .replace(/`/g, '')
      .trim();
    const parsedExamples = parseWorkedExamplesCell(workedExamplesCell);
    for (const ex of parsedExamples) {
      // Only add if not already present
      const dup = lesson.examples.some(
        (e) =>
          e.lessonRef === ex.lessonRef &&
          JSON.stringify(e.exampleNumbers) === JSON.stringify(ex.exampleNumbers),
      );
      if (!dup) {
        lesson.examples.push(ex);
      }
      allExamples.push(ex);
    }
  }

  // Sort lessons by lessonRef for deterministic output
  const lessons = Array.from(lessonsMap.values()).sort((a, b) =>
    a.lessonRef.localeCompare(b.lessonRef),
  );

  return { moduleNumber, lessons, examples: allExamples };
}

// ---------------------------------------------------------------------------
// parseModuleOverview
// ---------------------------------------------------------------------------

export function parseModuleOverview(markdown: string): ModuleOverviewExtract {
  const lines = markdown.split('\n');
  let moduleNumber = 1;
  let title = '';
  let description = '';
  const lessons: ModuleOverviewLesson[] = [];
  const skills: string[] = [];
  let currentSection = '';
  let inSkillsSection = false;

  // Collect description lines under ## Overview
  const descriptionLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // H1: # Module X: Title
    const h1Match = trimmed.match(
      /^#\s+Module\s+(\d+)(?::\s*(.+))?$/,
    );
    if (h1Match) {
      moduleNumber = parseInt(h1Match[1], 10);
      title = (h1Match[2] || '').trim();
      continue;
    }

    // ## section headings
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      currentSection = h2Match[1].toLowerCase();
      inSkillsSection = currentSection === 'skills developed';
      continue;
    }

    // ### lesson headings under "Lessons" section
    const h3Match = trimmed.match(
      /^###\s+(\d+)-(\d+)\s+(.+)$/,
    );
    if (h3Match && currentSection === 'lessons') {
      const modNum = parseInt(h3Match[1], 10);
      const lessonNum = parseInt(h3Match[2], 10);
      const lessonTitle = h3Match[3].trim();

      // Read description from subsequent paragraph(s)
      const descLines: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        if (
          nextLine === '' ||
          nextLine.startsWith('###') ||
          nextLine.startsWith('##')
        )
          break;
        descLines.push(nextLine);
        j++;
      }

      lessons.push({
        number: modNum,
        lessonNumber: lessonNum,
        title: lessonTitle,
        description: descLines.join(' ').trim(),
      });
      continue;
    }

    // Collect description under "Overview" heading
    if (currentSection === 'overview' && trimmed && !trimmed.startsWith('#')) {
      descriptionLines.push(trimmed);
    }

    // Skills section
    if (inSkillsSection && trimmed.startsWith('- ')) {
      skills.push(trimmed.slice(2).trim());
    }
  }

  description = descriptionLines.join(' ').trim();

  return { moduleNumber, title, description, lessons, skills };
}

// ---------------------------------------------------------------------------
// parseAleksRegistry
// ---------------------------------------------------------------------------

export function parseAleksRegistry(markdown: string): AleksRegistryExtract {
  const rows = parseMarkdownTable(markdown);
  const families: ProblemFamilyEntry[] = [];

  for (const row of rows) {
    const familyKey = (row['familyKey'] || '').replace(/`/g, '').trim();
    if (!familyKey) continue;

    const moduleStr = (row['Module'] || '').trim();
    const module = parseInt(moduleStr, 10) || 0;

    const objectivesText = (row['Objectives'] || '')
      .replace(/`/g, '')
      .trim();
    const objectives = objectivesText
      ? objectivesText.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    const sourceExamples = (row['Source examples'] || '').replace(/`/g, '').trim();
    const interactionShape = (row['Interaction shape'] || '')
      .replace(/`/g, '')
      .trim();
    const status = (row['Status'] || '').replace(/`/g, '').trim();
    const notes = (row['Notes'] || '').replace(/`/g, '').trim();

    families.push({
      familyKey,
      module,
      objectives,
      sourceExamples,
      interactionShape,
      status,
      notes,
    });
  }

  return { families };
}

// ---------------------------------------------------------------------------
// parseRevealLessonSource
// ---------------------------------------------------------------------------

export function parseRevealLessonSource(
  markdown: string,
): RevealLessonSourceExtract {
  const lines = markdown.split('\n');
  const lessons: RevealLesson[] = [];
  let currentLesson: RevealLesson | null = null;
  let currentExample: RevealExample | null = null;
  let exampleBodyLines: string[] = [];

  function flushExample() {
    if (currentLesson && currentExample) {
      currentExample.bodyExcerpt = exampleBodyLines.join('\n').trim().slice(0, 500);
      currentLesson.examples.push(currentExample);
    }
    currentExample = null;
    exampleBodyLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // ## Lesson X-Y
    const lessonMatch = trimmed.match(/^##\s+Lesson\s+(\d+-\d+)\s*$/);
    if (lessonMatch) {
      flushExample();
      currentLesson = {
        lessonRef: lessonMatch[1],
        examples: [],
      };
      lessons.push(currentLesson);
      continue;
    }

    // ### Example N — Title
    // or ### Example N: Title
    const exampleMatch = trimmed.match(
      /^###\s+Example\s+(\d+)\s*[—:-]\s*(.+)$/,
    );
    if (exampleMatch && currentLesson) {
      flushExample();
      currentExample = {
        index: parseInt(exampleMatch[1], 10),
        title: exampleMatch[2].trim(),
        lineNumber: i + 1,
        bodyExcerpt: '',
      };
      exampleBodyLines = [];
      continue;
    }

    // Collect body lines for current example
    if (currentExample && trimmed && !trimmed.startsWith('#')) {
      exampleBodyLines.push(trimmed);
    }
  }

  flushExample();

  return { lessons };
}

// ---------------------------------------------------------------------------
// parsePrecalcLesson
// ---------------------------------------------------------------------------

export function parsePrecalcLesson(
  markdown: string,
): PrecalcLessonExtract {
  const lines = markdown.split('\n');
  let title = '';
  let unit = 0;
  let topic = '';
  let lessonRef = '';
  const examples: PrecalcExample[] = [];
  let inWorkedExample = false;
  let currentExampleIdx = 0;
  let currentExampleLines: string[] = [];
  let currentExampleLine = 0;

  function flushExample() {
    if (currentExampleIdx > 0 && currentExampleLines.length > 0) {
      examples.push({
        index: currentExampleIdx,
        content: currentExampleLines.join('\n').trim(),
        lineNumber: currentExampleLine,
      });
    }
    currentExampleIdx = 0;
    currentExampleLines = [];
  }

  let firstNonEmptyFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip leading empty lines
    if (!firstNonEmptyFound) {
      if (!trimmed) continue;
      firstNonEmptyFound = true;

      // H1: # Lesson X-Y — Title or # Lesson X-Y: Title
      if (trimmed.startsWith('# ')) {
        const h1Text = trimmed.slice(2);
        const h1Match = h1Text.match(
          /^Lesson\s+(\d+-\d+)\s*[—\-–:]\s*(.+)$/,
        );
        if (h1Match) {
          lessonRef = h1Match[1];
          title = h1Match[2].trim();
        } else {
          title = h1Text;
        }
        continue;
      }
    }

    // Metadata headers
    const unitMatch = trimmed.match(/^Unit:\s*(\d+)/);
    if (unitMatch) {
      unit = parseInt(unitMatch[1], 10);
      continue;
    }

    const topicMatch = trimmed.match(/^Topic:\s*(.+)/);
    if (topicMatch) {
      topic = topicMatch[1].trim();
      continue;
    }

    // Section headings
    if (trimmed === '## Worked Example' || trimmed === '## Worked Examples') {
      inWorkedExample = true;
      continue;
    }

    if (trimmed.startsWith('## ') && trimmed !== '## Worked Example') {
      inWorkedExample = false;
      flushExample();
      continue;
    }

    // Example detection: **Example N:** or **Example N — **
    if (inWorkedExample) {
      const exampleMatch = trimmed.match(
        /\*\*Example\s+(\d+)\s*[:—\-]\s*\*\*\s*(.*)/,
      );
      if (exampleMatch) {
        flushExample();
        currentExampleIdx = parseInt(exampleMatch[1], 10);
        currentExampleLine = i + 1;
        currentExampleLines = [exampleMatch[2].trim()];
        continue;
      }

      const exampleMatch2 = trimmed.match(
        /^\*\*Example\s+(\d+)\*\*\s*[:—\-]?\s*(.*)/,
      );
      if (exampleMatch2) {
        flushExample();
        currentExampleIdx = parseInt(exampleMatch2[1], 10);
        currentExampleLine = i + 1;
        currentExampleLines = [exampleMatch2[2].trim()];
        continue;
      }

      if (currentExampleIdx > 0 && trimmed) {
        currentExampleLines.push(trimmed);
      }
    }
  }

  flushExample();

  return { title, unit, topic, lessonRef, examples };
}

// ---------------------------------------------------------------------------
// Duplicate detection helpers
// ---------------------------------------------------------------------------

export function collectDuplicateLessonRefs(
  lessons: { lessonRef: string }[],
): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const l of lessons) {
    if (seen.has(l.lessonRef)) {
      dupes.add(l.lessonRef);
    } else {
      seen.add(l.lessonRef);
    }
  }
  return Array.from(dupes).sort();
}

export function disambiguateSkillSlug(
  baseSlug: string,
  usedSlugs: Set<string>,
): string {
  if (!usedSlugs.has(baseSlug)) return baseSlug;
  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;
  while (usedSlugs.has(candidate)) {
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}
