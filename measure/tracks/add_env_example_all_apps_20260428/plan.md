# Plan: Add .env.example to All Apps

## Phase 1: Audit Existing Environment Variables

- [ ] Task: Check each app for existing .env files or env documentation
    - Inspect apps/integrated-math-3/ for existing .env or env docs
    - Inspect apps/bus-math-v2/ for existing .env or env docs
    - Inspect apps/integrated-math-1/ for existing .env or env docs
    - Inspect apps/integrated-math-2/ for existing .env or env docs
    - Inspect apps/pre-calculus/ for existing .env or env docs
- [ ] Task: Document all env vars actually used in each app's code/config
    - grep for `process.env` patterns
    - Check convex.json, next.config.js, package.json for env usage

## Phase 2: Create .env.example for Each App

- [ ] Task: Create .env.example for apps/integrated-math-3/
- [ ] Task: Create .env.example for apps/bus-math-v2/
- [ ] Task: Create .env.example for apps/integrated-math-1/
- [ ] Task: Create .env.example for apps/integrated-math-2/
- [ ] Task: Create .env.example for apps/pre-calculus/

## Phase 3: Verification

- [ ] Task: Run lint and typecheck for IM3
- [ ] Task: Run lint and typecheck for BM2
- [ ] Task: Verify all .env.example files are tracked in git
- [ ] Task: Push and commit