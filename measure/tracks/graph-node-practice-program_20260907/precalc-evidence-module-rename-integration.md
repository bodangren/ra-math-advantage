# Precalculus evidence module rename integration

The real local Convex backend rejected learning-evidence.ts because module paths cannot contain a hyphen. The integrated repair renames the file to selectedLearningEvidence.ts. It updates the selected route, generated API declaration, and affected test references. The existing learningEvidence.ts module stays unchanged. The renamed implementation has identical bytes.

The isolated full Convex directory loaded on the real local backend. No module was excluded. Parent verification in the shared worktree passed 151 selected tests in eight files, app lint, a fresh build, and standalone TypeScript after the build.

The rename is applied in the shared worktree with pending runtime integration. It does not change source approval or deploy to a cloud environment. Fresh transaction verification is tracked separately under Q35.
