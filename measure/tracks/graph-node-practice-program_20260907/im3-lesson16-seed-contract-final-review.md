# Lesson 1.6 seed contract repair

Source commits: `1acf76bdc` and `9ba9c5f49`.

The real local seed rejected two legacy shapes. Quiz questions used question and correctIndex fields. Activity sections also copied activity props into stored content. The first repair preserves both question prompts, option order, and the selected second answers while using the current quiz fields. The second repair stores only activityId and componentKey in each activity section. It keeps the questions on the activity record.

Parent and independent reviews accept both two-file patches. Each staged file matched the frozen candidate. The seed source was mixed in main and remains intact. Its previously clean test file matches the commits. Parent and independent focused runs pass 14 actual-handler tests. The author passes 71 related tests. Lint, build, and separate post-build TypeScript pass. Existing build warnings remain.

The first failed transaction left no lessons, activities, practice items, or variants. CLI reads confirmed empty tables. After both repairs, the same local database accepted the full Lesson 1.6 seed and the two browser wrappers. The completed demo seed did not run again. The QF baseline contains two activities, two canonical items, two variants, no submissions, and zero evidence, receipts, SRS cards, reviews, or scheduled work. The local push used type checking and disabled code generation. The original temporary TypeScript configuration is restored.

The ordinary quiz projection still does not load stored questions for the learner page. That separate defect remains open. These seed results do not prove the generic quiz works, QF browser acceptance, source approval, or full course coverage.
