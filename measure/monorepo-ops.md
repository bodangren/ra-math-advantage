# Monorepo Operations Quick Reference

> Convex operational commands and environment variables for each app in the monorepo.

## CI Architecture Gates

The package matrix in `.github/workflows/ci.yml` covers all 20 non-template
packages with blocking lint, test, and typecheck commands. The independent
boundary job runs both the manifest-aware import checker and exact inventory
parity validation. The manifest, root package commands, and CI matrix must
therefore cover the same workspace inventory; generated coverage is published
in `measure/generated/quality-gates.md`.

## App Paths

| App | Path |
|-----|------|
| Integrated Math 3 | `apps/integrated-math-3/` |
| Business Math 2 | `apps/bus-math-v2/` |

## Convex Commands by App

### Integrated Math 3 (IM3)

```bash
# Navigate to app directory
cd apps/integrated-math-3

# Local development (starts Convex dev server + frontend)
npm run dev
# Or use the dev stack script
npm run dev:stack

# Generate Convex types (runs automatically during dev)
npx convex dev

# Deploy to Convex production
npx convex deploy

# Run seed functions
npx convex run seed.ts
```

### Business Math 2 (BM2)

```bash
# Navigate to app directory
cd apps/bus-math-v2

# Local development (includes workbook manifest pre-generation)
npm run dev

# Generate Convex types
npx convex dev

# Deploy to Convex production
npx convex deploy

# Run seed functions
npx convex run seed.ts
```

## Required Environment Variables

### Integrated Math 3

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL (set in wrangler.jsonc) |
| `CONVEX_DEPLOY_KEY` | For deploy | Deploy key for `convex deploy` |
| `AUTH_JWT_SECRET` | For auth | JWT signing secret |
| `CLOUDFLARE_API_TOKEN` | For CI/CD | Cloudflare Workers AI edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | For CI/CD | Cloudflare account identifier |

### Business Math 2

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL (set in wrangler.jsonc) |
| `CONVEX_DEPLOY_KEY` | For deploy | Deploy key for `convex deploy` |
| `AUTH_JWT_SECRET` | For auth | JWT signing secret |

## Preflight Directory Check

Before running Convex commands, verify you are in the correct app directory:

```bash
# Check current directory
pwd

# Verify app structure exists
ls apps/integrated-math-3/convex    # Should show convex/ directory
ls apps/bus-math-v2/convex           # Should show convex/ directory
```

### Quick Check Script

Run this before Convex operations to verify correct directory:

```bash
# For IM3
if [ ! -d "apps/integrated-math-3/convex" ]; then
  echo "ERROR: Not in monorepo root or IM3 app not found"
  echo "Run: cd /path/to/monorepo && cd apps/integrated-math-3"
  exit 1
fi

# For BM2
if [ ! -d "apps/bus-math-v2/convex" ]; then
  echo "ERROR: Not in monorepo root or BM2 app not found"
  echo "Run: cd /path/to/monorepo && cd apps/bus-math-v2"
  exit 1
fi
```

## Convex Type Generation

Both apps auto-generate types during `npx convex dev`. The generated files are:

- `convex/_generated/api.d.ts` - Public API types
- `convex/_generated/server.d.ts` - Server-side types
- `convex/_generated/dataModel.d.ts` - Data model types

**Important**: Do not edit files in `convex/_generated/`. They are regenerated on each `convex dev` or `convex deploy`.

## Deployment Status

> **Verified 2026-07-01** against Cloudflare (account `bodangren@gmail.com` / `0f8cef50…42da20`) and Convex bindings in each `wrangler.jsonc` / `.env.local`. Timestamps go stale — **re-verify with the command below, don't trust the dates blind.**

**IM3 update, 2026-09-09:** The user deleted the entire IM3 test project before rollout. The replacement project is `bodangren/integrated-math-3` (project ID `2960816`). Its development deployment is `accurate-labrador-817`. The current Wrangler URL is `https://accurate-labrador-817.convex.cloud`. Committed backend source is deployed. The seed contract repairs are committed and deployed. All 52 lessons, 44 standards, and 79 lesson-standard mappings pass remote verification. The targeted retries preserved demo accounts. Practice-item references and demo phase states pass. These checks do not establish learner-flow or curriculum coverage. No frontend deployment ran during this rebuild. The IM3 row below is a historical snapshot, not the current backend. The main `.env.local` still selects the separate local anonymous deployment.

| App | CF Worker live? | Last CF deploy | Convex (prod URL in wrangler) | In CI deploy? |
|-----|-----------------|----------------|-------------------------------|---------------|
| integrated-math-3 | ✅ yes | 2026-04-11 | `chatty-weasel-888.convex.cloud` | ✅ (`ci.yml` Phase 6) |
| bus-math-v2 | ✅ yes | 2026-03-23 | `quiet-swan-141.convex.cloud` | ❌ manual only |
| integrated-math-1 | ❌ no worker (`code 10007`) | never | `127.0.0.1:3210` (localhost) | ❌ |
| integrated-math-2 | ❌ no worker (`code 10007`) | never | `127.0.0.1:3210` (localhost) | ❌ |
| pre-calculus | ❌ no worker (`code 10007`) | never | `127.0.0.1:3210` (localhost) | ❌ |

**Key facts (durable, not just snapshot):**
- **Nothing is deployed *from this monorepo*.** Both live workers were last deployed *before* the apps moved into `apps/` on 2026-04-18 (BM2 2026-03-23, IM3 2026-04-11). The live versions are the pre-monorepo standalone deploys and have drifted.
- **IM3 CI deploy has never landed as of the last remote verification.** The package typecheck failures identified on 2026-07-01 are fixed locally; on 2026-07-11 all 20 package lint, test, and typecheck gates passed under the complete manifest-driven inventory. A post-fix remote CI/deploy run has not yet been observed, so this does not claim a production deployment.
- **IM1 / IM2 / pre-calculus are scaffolds** — no Cloudflare worker exists and their `wrangler.jsonc` points at `localhost`, so deploying as-is would yield a backend-less worker.
- pre-calculus `.env.local` borrows IM3's dev Convex deployment (`focused-malamute-141`); it has no Convex backend of its own.

**Re-verify (read-only):**

```bash
npx wrangler login            # if "Not logged in" / token expired
for app in bus-math-v2 integrated-math-1 integrated-math-2 integrated-math-3 pre-calculus; do
  echo "== $app =="
  npx wrangler deployments list --config "apps/$app/wrangler.jsonc" 2>&1 | grep -E 'Created:|code: 10007' | tail -2
done
```

## Cloudflare Deployment

### IM3 Deploy

```bash
cd apps/integrated-math-3
npm ci
npm run build
wrangler deploy --config wrangler.jsonc
```

### BM2 Deploy

```bash
cd apps/bus-math-v2
npm ci
npm run build
wrangler deploy --config wrangler.jsonc
```

## Troubleshooting

### Port Already in Use

Convex dev server uses port 3210 by default. If port is in use:

```bash
# Find and kill process using port 3210
lsof -ti:3210 | xargs kill -9
```

### Type Generation Issues

If types are stale after schema changes:

```bash
cd apps/integrated-math-3  # or apps/bus-math-v2
rm -rf convex/_generated
npx convex dev
```

### Auth Errors

If encountering auth errors during deploy:

1. Verify `CONVEX_DEPLOY_KEY` is set in environment
2. Verify `AUTH_JWT_SECRET` matches production secret
3. Check Convex dashboard for deployment status
