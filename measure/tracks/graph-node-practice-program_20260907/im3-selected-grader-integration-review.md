# IM3 selected quadratic grader integration review

The selected grader uses the stored quadratic equation and the fixed x-values -2, -1, 0, 1, and 2. The table requires exact values. The graph permits a coordinate tolerance of 0.25. Each response must contain five distinct matching points. The canonical rubric uses `table_values` and `placed_points`, with one point for each part.

The review uses literal fixtures. For `y = -x^2 - 1`, the expected y-values are -5, -2, -1, -2, and -5. For `y = x^2 - x - 2`, they are 4, 0, -2, -2, and 0. Tests cover the exact tolerance boundary and a value just outside it. They also cover missing and duplicate points, invalid equations, invalid rubrics, and both Guided and Independent modes.

The grader replaces client score fields. It retains response and assistance data. It sets the physical stored activity identifier. The `masteryContractVersion` field is contract metadata. It does not create evidence or establish mastery. The submission writer must enforce publication, identity, response shape, readiness, and assistance policy before any evidence write.

The initial isolated extraction threw for unsupported identities. The broad pending app grader instead leaves these responses ungraded. The parent reconciled the isolated extraction to this existing behavior. Both versions now return no score or mastery metadata for malformed selected identities. They remove score and correctness fields from response parts. Strict rejection belongs in the submission writer.

The integration patch includes only the selected grader, its three identity constants, and the selected test file. It excludes other pending graph capabilities and their grading branches. The parent preserves the broad working file when staging this patch.

The parent main-app check passed 28 selected tests, full lint, standalone TypeScript, and the production build. The build log is `/tmp/im3-selected-grader-root-build.log`. The isolated patch also passes the selected tests. The isolated app uses the shared installed workspace packages. Its earlier TypeScript check found unrelated package declaration errors. This limits the claim for detached-HEAD type verification.

The selected draft curriculum remains unpublished. Writer, route, seed, evidence, and positive browser integration remain open.
