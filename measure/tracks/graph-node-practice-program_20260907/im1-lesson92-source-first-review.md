# IM1 Lesson 9-2 source independent review

## Disposition

Reject the source patch until it restores the missing source data and conditions.

I read both rendered pages and the DOCX paragraph text. I inspected the candidate lesson and its six tests. I also compared all seven candidate PNG files with the native DOCX media.

## Blocking findings

1. Problem 10 omits the final values `42` and `38`. The original list has 22 ages. The candidate has 20 ages. This changes the data set that the learner must graph.

2. Several prompts remove source conditions or add a new condition.

   - Problem 1 removes the summer reading program context.
   - Problem 3 removes Mr. Dalton's science class and the survey context.
   - Problem 5 adds an explicit request to explain the display choice. The source asks the learner to determine the display and make the graph. It does not print a separate explanation instruction.
   - Problem 6 removes customers and the past-several-days context.
   - Problem 9 removes the 10K race and Masonville context.
   - Problem 11 removes the scientific study, week 1, and population-distribution context.
   - Problem 12 replaces pets owned by Liza's classmates with a survey and an invented `Number of Students` table heading.
   - Problem 16 removes the grocery-store inference framing.

   These changes are small in prose length, but they are not a faithful restoration of the source prompts.

3. Some accessible tables do not preserve the printed labels.

   - Problem 1 provides an unlabeled Markdown table. The native table label is `Number of Books Read`.
   - Problem 3 changes `Destination` and `Number of Votes` to `Field Trip Destination` and `Number of Students`.
   - Problem 6 provides an unlabeled Markdown table. The native table label is `Prizes Won`.

   The images show the source labels, but an accessible text representation must also preserve them.

4. The tests do not reject these defects. The Problem 10 assertion checks only the first six values. The table test checks fragments and does not check the printed headings. The prompt test does not check the removed contexts or the added Problem 5 instruction.

## Confirmed source data

The candidate preserves all 17 problem numbers and all printed subpart letters. It preserves the literal malformed Problem 7(b) text. It preserves all eight pet categories in Problem 12.

The Problem 13 accessible frequencies are correct for ratings 1 through 10: `1, 0, 2, 0, 0, 0, 4, 6, 8, 4`.

The Problem 16 accessible values and units are correct. The values are in thousands of dollars. The 2016 and 2017 pairs are Creamy `200, 250`; Crunchy `300, 400`; With Jelly `50, 35`; Natural `60, 120`; and Sugar Free `75, 100`.

The lesson does not disclose answers. It does not add the false rule that all discrete data require bar graphs and all continuous data require histograms.

## Media and patch scope

The DOCX contains seven native PNG files. Each candidate PNG is byte-identical to the corresponding native file.

The patch changes nine repository paths: one lesson file, one test file, and seven PNG files. The report's grouped path list has three entries, but its detailed scope correctly describes nine files. A claim of 10 changed paths is incorrect.

## Verification

The focused test passes: 6 of 6. This result does not detect the source defects above.

The source patch needs stronger assertions for the complete Problem 10 data list, the exact source contexts, and accessible table labels. The author must then correct the lesson and rerun the focused test and application gates.
