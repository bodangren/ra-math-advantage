# Dependency correction

The root dependency tree has 18 audit findings on 2026-09-07. Fifteen have high severity. This includes development tools and runtime packages.

Update the Business Math direct dependency ranges to Convex 1.45.0 and Next.js 16.3.4. Update vinext to 1.0.0-beta.9. Update the shared Cloudflare Vite plugin to 1.54.4 if the app build requires it. Resolve patched transitive packages in the root lockfile. Keep each update within its current major version except vinext. The vinext update crosses from 0.0.55 to the current 1.0 beta series.

The root lockfile is shared by all apps. Run Business Math type checks, lint, tests, browser checks, and the production build after the update. Check other workspace dependency resolutions before committing the lockfile. Do not deploy from this task.

Do not run a forced audit fix. Review any remaining advisory and its dependency path first.

Source checks: npm registry version metadata and npm audit. React Server DOM requires version 19.2.8 or later for GHSA-wx67-qw84-cm4g. The installed image-size dependency has denial-of-service findings. The newer vinext dependency tree must remove or repair this dependency path.
