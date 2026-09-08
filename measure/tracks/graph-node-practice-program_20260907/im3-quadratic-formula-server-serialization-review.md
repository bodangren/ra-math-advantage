# QF backend storage serialization review

The second frozen backend batch is not accepted.

The parent replaced the writer test's memory clone with `jsonToConvex(convexToJson(storedRow))` from the installed `convex/values` package. The original request then failed with `idempotency_conflict`. Seven other writer tests passed. The installed serializer sorts object keys. A JSON comparison that retains object insertion order does not provide stable replay after storage serialization.

The regression is preserved at `/tmp/im3-qf-server-parent-serialization-probe.test.ts`. The output is `/tmp/im3-qf-server-parent-serialization.log`. The temporary candidate test was removed after the probe.

Use the existing Convex value serializer to normalize the compared payload. Do not add a hash or a new serialization framework. Test both nested telemetry and changed payload conflicts. A memory clone is not a storage round trip.

The parent also found that physical-link-only legacy guards skip variant inspection when the activity has duplicate item links. Correct this bypass without changing unrelated valid legacy activities.

The final combined build and separate TypeScript check passed on this version. These results do not override the failed replay behavior.
