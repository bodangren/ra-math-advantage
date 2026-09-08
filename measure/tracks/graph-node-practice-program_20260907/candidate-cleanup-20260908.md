# Completed candidate cleanup

Removed the completed Lesson 9-5 source archive and the Precalculus unit 6 surface archive.

The parent compared all 13 Lesson 9-5 patch paths and all 14 Precalculus patch paths with committed bytes. All match. The parent also compared the archive source files with their original Git bases. Every changed source file is preserved in HEAD. Extra planning and review text is preserved in HEAD.

Independent review found no unpreserved content in the Precalculus archive. Generated build files, TypeScript cache files, temporary Git data, and dependency links were disposable. Removal did not follow dependency links. The archived IM3 Python virtual environment is a dependency directory. It was excluded from source comparisons.

The active Lesson 9-5 graph candidate and the local browser candidate remain in use. All 24 saved Codex worktrees contain uncommitted work. They remain intact. There are 25 registered worktrees, including the main checkout. The earlier cleanup removed 85 stale registrations after checking missing directories and commit ancestry.
