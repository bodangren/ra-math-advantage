# IM1 Lesson 9-4 source first review

Reject the first source candidate at `/tmp/im1-g47-source-head-20260908.kWpgt1`. Its six passing tests do not establish source fidelity.

The parent compared the candidate with original DOCX paragraph text. Multiple changes alter the mathematical variables or context:

- Problem 7 changes event attendance to festival attendance in thousands.
- Problem 8 changes the books that one student checks out to books checked out by seven students.
- Problem 9 changes soda dispensed into 36-ounce cups to soda in eleven bottles.
- Problem 10 changes ages of riders to ages of roller coasters.
- Problem 20 changes counts of parked cars to parking revenue in dollars.
- Problem 21 changes a hockey team to one player and replaces the source label.
- Problem 24 changes Renee's online price research for a planned trip to her aunt's house into an aunt recording prices.
- Problem 26 changes high-school students to customers.

Other prompts also paraphrase the source or omit labels. Restore all original wording, conditions, labels, and subparts. Markdown formatting can change. Mathematical meaning and source text cannot change in this restoration task.

Add full-context regressions before the correction. Confirm that these tests fail on this candidate. Review every prompt again against the native source. Numerical-list checks and image byte matches cannot detect these context errors.

No part of this rejected source patch was applied to main.
