# IM1 Lesson 4-4 original source evidence

Status: Read-only source inspection. This note does not approve a skill or change the curriculum graph.

## Inspected source

The repository contains the original worksheet at:

`apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0404_practice.docx`

The bundle README identifies this directory as a copy of the original practice worksheets from the OneDrive archive. The course specification identifies the textbook lessons as the canonical content source.

I inspected these parts of the DOCX package:

- `word/document.xml`
- `word/media/image1.png` through `word/media/image8.png`

I also rendered the DOCX with the local LibreOffice installation. This produced this temporary inspection copy:

- `/tmp/int1_0404_render/Int1_0404_practice.pdf`
- `/tmp/int1_0404_render/page-1.png` through `/tmp/int1_0404_render/page-4.png`

The page images are available for visual inspection at these exact paths:

- `/tmp/int1_0404_render/page-1.png`
- `/tmp/int1_0404_render/page-2.png`
- `/tmp/int1_0404_render/page-3.png`
- `/tmp/int1_0404_render/page-4.png`

The temporary files are derived inspection artifacts. The DOCX in the repository is the source.

## Exact evidence

Page 1 has the title `Transformations of Linear Functions · Practice`. The first prompt asks the student to describe each translation relative to the parent function. Problems 1 through 6 use these rules:

- `g(x) = x + 11`
- `g(x) = x - 8`
- `g(x) = (x - 7)`
- `g(x) = (x + 12)`
- `g(x) = (x + 10) - 1`
- `g(x) = (x - 9) + 5`

The related graph images show a straight line through the origin with slope 1. They do not show a V-shaped absolute-value graph.

Page 2 uses the same parent in dilation and reflection notation. Examples include `g(x) = 5(x)`, `g(x) = (3x)`, and `g(x) = -4(x)`. The DOCX uses parentheses in these rules. It does not use absolute-value bars.

Page 4 gives direct confirmation. Problem 33 states that Hannah wrote `f(x) = x`. Problem 35 calls `y = x` the parent function.

Problem 34 asks whether a horizontal shift of a linear function has the same effect as a vertical shift by the opposite amount. It requires a justification with graphs. It does not state that this equivalence holds for every linear function. Problem 35 asks what a vertical compression of `y = x` implies about the horizontal dilation. These prompts ask the student to analyze when the descriptions have the same effect.

## Disposition

The original worksheet confirms the linear parent function `f(x) = x`. The available original does not support the claim that extraction removed absolute-value bars.

The source notation issue is resolved. The mathematical equivalence remains intentional for the stated parent. For `f(x) = x`, the rules `f(x - h)` and `f(x) - h` give the same function. The rules `f(bx)` and `b f(x)` also give the same function. These identities do not apply unchanged to every linear function.

The worksheet supports identification of the stated operation from an unsimplified rule. It does not support a claim that a student can always distinguish the operation from the resulting graph or simplified equation. Problems 34 and 35 require the student to explain this limitation. An assessment must accept equivalent horizontal and vertical descriptions when it asks about the resulting graph or simplified function. It can require the named operation when the prompt identifies the unsimplified operation.

The six Lesson 4-4 candidates must remain provisional, draft, and inactive during source review. This evidence does not add approval, mastery transfer, equivalence, prerequisite, renderer, or mode specifications. Any later wording for the vertical-versus-horizontal candidate must preserve the linear-function equivalence in Problems 34 and 35.

No curriculum or source graph file changed during this inspection.
