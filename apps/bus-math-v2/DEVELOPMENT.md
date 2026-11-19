# Business Math development

Use the dependency versions in this app's package file and the root lockfile. The app uses React, TypeScript, Vite, and vinext. Convex stores users, curriculum, progress, and submissions. Cloudflare Workers serves the deployed app.

## Local setup

Run commands from `apps/bus-math-v2`. Install dependencies from the repository root only after approval. Copy `.env.example` to `.env.local`. Use the URL of the local Convex deployment. Keep `AUTH_JWT_SECRET` and `CONVEX_DEPLOY_KEY` private.

Run `npm run dev:stack` to start the local Convex backend and the app. Use `npm run dev` only when the backend is already running. A successful frontend build does not prove that the backend is available.

Before changing Convex code, read `convex/_generated/ai/guidelines.md`. The app uses cookie sessions. Browser components call authenticated app routes for private data. Only server code can call internal Convex functions.

## Verification

Run `npm run typecheck`, `npm run lint`, `CI=true npm test -- --maxWorkers=2`, and `npm run build`. The vinext build does not enforce TypeScript types. Run the Playwright browser tests after these checks.

## Curriculum and resources

The published curriculum is assembled in `lib/curriculum/published-manifest.ts`. Unit 1 content is in `lib/curriculum/generated/unit1-authored.ts`. Reviewed Units 2-8 instruction is in `lib/curriculum/reviewed-instruction.json`. The capability graph is in `curriculum/skill-graph`.

Student workbooks are in `public/workbooks`. Teacher solutions are in `resources/workbooks`. Never place teacher solutions in `public`. Server routes import resources into the worker bundle. They must not use a local filesystem path at runtime.

The class and group datasets for Units 2-8 use `Input,Value` columns. Match each input label to the workbook input area. Unit 1 keeps its account, account type, and balance columns. The PDF guides describe the workbook checks and presentation criteria.

## Deployment

Use `.github/workflows/business-math-deploy.yml` for this app. Configure the `business-math-production` GitHub environment with `BM2_CONVEX_URL`, `CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID`. Set the worker's private authentication and Convex secrets before release. The workflow deploys `dist/server/wrangler.json` after the app checks pass.

Deploy the matching Convex backend before the worker release. Use an explicitly selected Business Math deployment. Test this backend and the built worker together before release. The frontend workflow does not deploy the backend.

Curriculum seeding is a separate operation. Select the deployment explicitly. Verify published phase identity and existing progress before a seed. Never seed production as part of a frontend build.

## Reviewed curriculum version

The review corrections use version 2 for Units 2–8 and the capstone. Unit 1 Lessons 4–7 and 11 also use version 2. Other Unit 1 lessons retain version 1.

The seed preserves existing phase IDs for unchanged content. It rejects a content change under an existing version number. It keeps earlier lesson versions, activity records, submissions, and progress. The current dashboard shows the latest published version. Learners must complete changed tasks in that version. Do not copy old completion records to new assessments. A teacher must review earlier evidence before deciding whether a learner needs an accommodation.

Run a seed first on a database copy. Review the version transition before a release. The local review used a copied backend on ports 3212 and 3213. It did not change production data.

## Node development option

If the installed Cloudflare development runner fails, use `BM2_DEV_RUNTIME=node npm run dev`. This option applies only to the development server. Production builds still use the Cloudflare plugin. Verify both the build and the built worker before release.

## Spreadsheet formulas

The browser and server use the same course functions. The installed parser supplies standard arithmetic and aggregate functions. `lib/activities/spreadsheet-functions.ts` supplies the missing financial functions, SWITCH, and scalar XLOOKUP. XLOOKUP returns one cell. It does not create spilled arrays. Invalid formulas return an error and cannot satisfy a numeric target. IRR stops after 100 iterations if the cash flow does not converge.

Financial functions use the cash-flow signs and payment timing in the [Microsoft PMT specification](https://support.microsoft.com/en-US/Excel/pmt-function) and [PV specification](https://support.microsoft.com/en-us/excel/functions/pv-function). NPV discounts its first cash flow by one period. IRR treats its first cash flow as time zero. See the [Microsoft NPV specification](https://support.microsoft.com/en-us/excel/functions/npv-function) and [IRR specification](https://support.microsoft.com/en-us/excel/functions/irr-function).
