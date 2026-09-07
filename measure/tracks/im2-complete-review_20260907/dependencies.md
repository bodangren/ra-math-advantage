# IM2 dependency correction plan

Checked on 2026-09-07. The current production dependency audit reports six high-severity package entries. This count does not mean that IM2 has six independently exploitable paths.

| Package | Current shared lock version | Candidate version | Current evidence |
|---|---|---|---|
| convex | 1.40.0 | 1.45.0 | Direct app dependency. The audit entry includes its ws dependency. |
| ws | 8.20.1 | 8.21.3 | Convex, Miniflare, and the Cloudflare Vite plugin pin the affected version. Updating one direct package may not remove every path. |
| next | 16.2.7 | 16.3.4 | The app imports Next APIs through vinext. The native Next server advisory paths require separate runtime verification. |
| nanoid | 3.3.12 | 3.3.18 | Transitive through PostCSS. The reported failures require zero or negative custom-generator sizes. No direct IM2 call was found. |
| postcss | 8.4.31 | 8.5.28 | Used in CSS tooling. The audit includes source-map loading and stringification defects. No user CSS upload path was found in IM2. |
| sharp | 0.34.5 | 0.35.4 | Transitive package with libvips advisories. The inspected vinext image handler uses Cloudflare Images or file passthrough. It does not call sharp in that handler. Other workspace consumers still require review. |

Candidate versions came from the npm registry. They are review candidates, not approved changes. Compatibility testing remains necessary. In particular, the sharp change crosses a minor boundary in a pre-1.0 package.

## Required update procedure

1. Obtain approval for dependency and shared lockfile changes.
2. Check current versions again before editing. Other workspace tasks can change the lockfile.
3. Update direct packages with compatible supported releases. Check every remaining transitive ws and nanoid path.
4. Run the affected workspace tests, lint, TypeScript checks, and production builds.
5. Run the production dependency audit again.
6. Record any remaining advisory with its actual runtime path. Do not use a forced audit fix.

## Sources

- [WebSocket memory exhaustion](https://github.com/advisories/GHSA-96hv-2xvq-fx4p)
- [Nanoid zero-size generator loop](https://github.com/advisories/GHSA-2v37-7h3g-55p8)
- [PostCSS source-map read](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp)
- [Sharp and libvips advisories](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)
- [Next Server Actions denial of service](https://github.com/advisories/GHSA-m99w-x7hq-7vfj)

The full current audit is saved in `evidence/dependency-audit-current.json`. No dependency update or production deployment occurred in this correction pass.
