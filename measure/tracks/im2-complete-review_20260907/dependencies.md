# IM2 dependency correction plan

Checked again on 2026-09-08 against the current shared lockfile. The repository production audit reports six high-severity package entries. The full audit reports 18 package entries: 15 high, two moderate, and one low. These counts do not establish independently exploitable IM2 paths.

The full audit includes `vinext` through `image-size`. IM2 uses `vinext` for build and start commands, although its package declaration lists it under development dependencies. An `--omit=dev` audit cannot establish the deployed runtime scope. Check the built application and its deployment dependencies. The full audit also includes `react-server-dom-webpack`, Cloudflare tooling, and other workspace dependencies. Their IM2 paths remain under review.

| Package | Current shared lock version | Candidate version | Current evidence |
|---|---|---|---|
| convex | 1.40.0 | 1.45.0 | Direct app dependency. The audit entry includes its ws dependency. |
| ws | 8.20.1 | 8.21.3 | Convex, Miniflare, and the Cloudflare Vite plugin pin the affected version. Updating one direct package may not remove every path. |
| next | 16.2.7 | 16.3.4 | The app imports Next APIs through vinext. The native Next server advisory paths require separate runtime verification. |
| nanoid | 3.3.12 | 3.3.18 | Transitive through PostCSS. The reported failures require zero or negative custom-generator sizes. No direct IM2 call was found. |
| postcss | 8.4.31; nested 8.5.15 | 8.5.28 | The root copy is 8.4.31. Tailwind and Vite each contain 8.5.15. The full audit flags all three copies. The audit includes source-map loading and stringification defects. No user CSS upload path was found in IM2. |
| sharp | 0.34.5 | 0.35.4 | Transitive package with libvips advisories. The inspected vinext image handler uses Cloudflare Images or file passthrough. It does not call sharp in that handler. Other workspace consumers still require review. |

Candidate versions were read from the npm registry on 2026-09-07. This review did not revalidate those candidates. They are review candidates, not approved changes. Compatibility testing remains necessary. In particular, the sharp change crosses a minor boundary in a pre-1.0 package.

## Required update procedure

1. Obtain approval for dependency and shared lockfile changes.
2. Check current versions again before editing. Other workspace tasks can change the lockfile.
3. Update direct packages with compatible supported releases. Check every remaining transitive ws, nanoid, PostCSS, and sharp path. Include build and development tooling that enters the deployed application. Treat audit-suggested major or prerelease upgrades as separate compatibility decisions.
4. Run the affected workspace tests, lint, TypeScript checks, and production builds.
5. Run both `npm audit --json --ignore-scripts --omit=dev` and `npm audit --json --ignore-scripts` from the repository root. Save both results with their scope and date.
6. Record any remaining advisory with its actual runtime path. Do not use a forced audit fix.

## Sources

- [WebSocket memory exhaustion](https://github.com/advisories/GHSA-96hv-2xvq-fx4p)
- [Nanoid zero-size generator loop](https://github.com/advisories/GHSA-2v37-7h3g-55p8)
- [PostCSS source-map read](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp)
- [Sharp and libvips advisories](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)
- [Next Server Actions denial of service](https://github.com/advisories/GHSA-m99w-x7hq-7vfj)

The earlier production-only audit is saved in `evidence/dependency-audit-current.json`. It is not the full dependency audit. The 2026-09-08 production and full results are saved in `evidence/dependency-audit-production-20260908.json` and `evidence/dependency-audit-full-20260908.json`. Both commands returned exit status 1 because they reported advisories. No dependency update or production deployment occurred in this review.
