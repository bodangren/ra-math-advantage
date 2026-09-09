# Independent review: IM3 Lesson 1.6 server-owned quiz

Decision: accepted for source integration. The disposable local learner proof remains required.

The frozen patch contains the exact 17 scoped paths. Applying it to baseline `b6e99cac704ccbefa36e57176077dbe17fd9ca6c` reconstructs all 17 candidate files exactly.

The production flow uses one Convex-only private question source. The student projection returns only the two public questions. The mutation resolves the canonical selected Lesson 1.6 version, phase 10, sequence 2, and physical activity relation. It validates the fixed option domain. It grades on the server. It writes no mastery or SRS authority.

The GET path reads the newest learner-and-activity row through `by_user_and_activity`. It validates that row and does not fall back to an older row. The explicit quiz selector preserves the default selected Worked query. The public parser rejects extra receipt fields.

`LessonRenderer` owns the phase gate. It freezes the request and idempotency key. It keeps failed requests for retry. It guards GET and POST results with the current physical identity and revision. The deferred POST test leaves the phase, returns after a null GET, reuses one live request, preserves the frozen answers, and adopts the result only for the current quiz. A valid POST or GET receipt completes the required activity. An invalid result keeps the phase gated.

The wrapper renders two prompts and eight options. It submits only ungraded answers. It locks the frozen selections during retry. The receipt-driven React key remount restores the submitted selections and score after GET.

The tests cover all 16 ordered answer pairs. The totals are 9 with score 0, 6 with score 1, and 1 with score 2. They also cover private-field exclusion, Convex object-key transport, strict request shapes, exact replay, changed-key conflict, malformed newest history, selected Worked preservation, stale asynchronous results, and zero effect tables.

Independent verification passed 181 tests in the seven focused files. The reported lint, build, and post-build TypeScript gates passed. I did not rerun the build.

The memory database tests do not prove actual Convex transaction behavior or browser integration. Run the accepted disposable local learner flow before final runtime acceptance.
