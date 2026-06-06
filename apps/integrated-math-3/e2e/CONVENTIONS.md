# E2E Conventions — Integrated Math 3

## Selectors

All `data-testid` values used in E2E specs are defined in `e2e/selectors.ts`.

- **Export from `SEL`** — never inline selector strings in specs or components.
- **kebab-case** — values must match `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`.
- **No duplicates** — each value is unique across the entire `SEL` object.
- **App components use inline strings matching `SEL` values** — app code must not import from `e2e/`.
- **E2E specs import `SEL`** — specs use `SEL.key` to locate elements.

### Adding a new selector

1. Add the key-value pair to `e2e/selectors.ts` under `SEL`.
2. Add `data-testid="<value>"` to the target component.
3. The unit test in `__tests__/e2e/selectors.test.ts` enforces kebab-case and uniqueness automatically.

## Seed

The E2E seed is a single Convex `internalAction` at `convex/seed/seed_demo_e2e.ts`.

- **Composes existing seed mutations** — delegates to `seedDemoEnv` and `seedDemoProgress`; never duplicates their logic.
- **Idempotent** — keyed by `E2E_SEED_KEY` (`e2e-seed-v1`) from `e2e/selectors.ts`.
- **Reset via tombstone-delete** — not by table truncation. The `E2E_SEED_KEY` stamps seeded records so a future reset can find them.
- **No DB writes from the Playwright harness** — seed code is convex-side only.

### Running the seed

```bash
npx convex run seed.seedDemoE2E
```

### Auth credentials

The seed guarantees these accounts exist and are active:

| Username | Password | Role |
|----------|----------|------|
| `teacher@demo` | `Demo1234!` | teacher |
| `student1@demo` | `Demo1234!` | student |
| `student2@demo` | `Demo1234!` | student |
| `student3@demo` | `Demo1234!` | student |
| `student4@demo` | `Demo1234!` | student |
| `student5@demo` | `Demo1234!` | student |

## File layout

```
e2e/
├── selectors.ts          # SEL constants + E2E_SEED_KEY
├── fixtures.ts           # studentPage / teacherPage Playwright fixtures
├── seed-smoke.spec.ts    # Phase 1 smoke spec
├── auth.spec.ts          # Auth E2E specs
├── lesson-navigation.spec.ts
├── daily-practice.spec.ts
├── accessibility.spec.ts
└── CONVENTIONS.md        # This file
```
