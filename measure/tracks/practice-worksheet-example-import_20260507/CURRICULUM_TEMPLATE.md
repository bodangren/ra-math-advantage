# Canonical Curriculum File Template

> Reference document for subagents authoring or amending `module-N-lesson-M` curriculum files.

## File Naming

- **Lessons:** `module-N-lesson-M` (no extension)
- **Topic summaries:** `module-N-<topic>.md`

## Required Sections

Every lesson file must contain the following sections in order:

### 1. Lesson Header

```markdown
# Lesson N-M — <Descriptive Title>
```

- Use an em-dash (—) after the lesson code
- Title should match the worksheet title without "⸱ Practice"
- Example: `# Lesson 1-1 — Graphing Quadratic Functions`

### 2. Source Reference

```markdown
Source: (Module N, Lesson N-M, IntX_MMLL_practice.docx)
```

- Include the exact worksheet filename for traceability

### 3. Today's Goals

```markdown
## Today's Goals

* <Goal 1>
* <Goal 2>
```

- 2–4 bullet points describing what students should be able to do after this lesson
- Use active verbs: graph, solve, analyze, compare, evaluate, construct
- Derived from the worksheet title, example-group headings, and problem types

### 4. Vocabulary

```markdown
## Vocabulary

* **<term>** — <definition>
```

- Include key terms that appear in the worksheet or are essential to the lesson topic
- Definitions should be concise (1 sentence)

### 5. Explore Section (if applicable)

```markdown
## Explore: <Inquiry Title>

<Description of inquiry-based opening activity>

Inquiry Question:
<Open-ended question>
```

- Optional. Include if the worksheet suggests an exploratory activity or if the lesson topic naturally lends itself to inquiry.
- Derived from worksheet example groups that involve exploration, graphing technology, or discovery.

### 6. Learn Sections

```markdown
## Learn: <Concept Title>

<Key concept explanation>

### Key Concept: <Concept Name>

* <Bullet 1>
* <Bullet 2>
```

- One or more Learn sections covering the core concepts
- Each should have a Key Concept block with concise bullet points
- Use math delimiters for formulas and equations

### 7. Example Sections

```markdown
## Example K — <Descriptive Title>

### Step 1: <Step Name>

<Description of what students do in this step>

[
<representative math>
]

### Step 2: <Step Name>

...
```

- Numbered examples matching the worksheet's example-group structure
- **CRITICAL:** Each example must describe what the problem asks students to **DO** (objective and process), not transcribe the exact problem text verbatim
- Include representative math using `[` `]` delimiters
- Break into steps when the process is multi-step
- Include tables when the process involves tabular data

### 8. Mixed Exercises

```markdown
## Mixed Exercises

<Description of the practice problem set's intent and skill coverage>
```

- Describe the types of problems in the mixed exercises section
- Note the range of skills practiced
- Do not list every problem verbatim

### 9. Review Notes (optional)

```markdown
## Review Notes

* <Note about unsupported constructs, gaps, or needed human review>
```

- Use for flagging images that couldn't be described, ambiguous problems, or content that needs teacher review

---

## Math Delimiter Convention

Use `[` and `]` on their own lines for block math:

```markdown
[
y = ax^2 + bx + c, \quad a \ne 0
]
```

For inline math within a paragraph, use `[` and `]` without line breaks:

```markdown
The vertex is at [ (h, k) ] and the axis of symmetry is [ x = h ].
```

### Common LaTeX Patterns

| Meaning | LaTeX |
|---------|-------|
| Exponent | `x^2` |
| Fraction | `\frac{num}{den}` |
| Square root | `\sqrt{x}` |
| Plus/minus | `\pm` |
| Not equal | `\ne` |
| Greater than or equal | `\ge` |
| Less than or equal | `\le` |
| Infinity | `\infty` |
| Pi | `\pi` |
| Times | `\times` |
| Triangle | `\triangle` |
| Angle | `\angle` |
| Degree | `^\circ` |

---

## Content Guidance: Objective and Process

### What to Write

For each example, describe:
1. **The objective:** What mathematical skill or concept is being practiced?
2. **The process:** What steps does a student take to solve this type of problem?
3. **Representative math:** Show the mathematical form using `[` `]` delimiters.

### Before/After Examples

**❌ Bad — verbatim transcription:**
```markdown
## Example 1

1. f(x) = x^2 + 6x + 8
2. f(x) = -x^2 - 2x + 2
3. f(x) = 2x^2 - 4x + 3
```

**✅ Good — objective and process:**
```markdown
## Example 1 — Graph Quadratic Functions

Graph quadratic functions in standard form and state their domain and range.

### Step 1: Identify Coefficients

Determine the values of [ a ], [ b ], and [ c ] in [ f(x) = ax^2 + bx + c ].

### Step 2: Find Key Features

Calculate the axis of symmetry:
[
x = -\frac{b}{2a}
]

Find the vertex by evaluating [ f(-\frac{b}{2a}) ].

### Step 3: State Domain and Range

* Domain: all real numbers, [ (-\infty, \infty) ]
* Range: depends on the vertex and direction of opening
```

### Rules

- Do NOT copy every problem number and exact wording from the worksheet
- DO describe the problem type, the mathematical process, and show representative examples
- When a worksheet has 6 nearly identical problems under one example heading, describe the general approach once
- When problems vary significantly within one example group, note the variations
