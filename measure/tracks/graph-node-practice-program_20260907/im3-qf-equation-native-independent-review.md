# IM3 quadratic-formula equation reconciliation review

## Result

Accepted for the native reconciliation behavior.

The retained local snapshots prove the exact stored-data transition. The successful read-only browser follow-up proves the corrected equation display in pending and saved states. The first strict browser runner failed its final external-request check after it created two draft attempts. The follow-up read those retained attempts without a write.

## Native snapshot findings

I ran the retained comparison script against `equation-before-fresh.json` and `equation-after.json`.

- The two canonical activity IDs are unchanged.
- Each old equation changed to the same equation plus one terminal ` = 0`.
- Only `props.equation` and `updatedAt` changed in each activity document.
- All eight variant documents are unchanged.
- All eight practice item documents are unchanged.
- All eight submission documents are unchanged.
- Both synthetic learner documents are unchanged.
- All effect tables are empty before and after reconciliation.

I also compared `equation-after.json` with `equation-after-second.json`. The full parsed snapshots are equal. This proves that the second reconciliation is a no-op for all captured documents.

The reconciliation summary agrees with these findings. The first helper returned no value. The command runner incorrectly tried to parse the empty standard output as JSON. Root then captured the post-call state with a read-only query. This runner error is an output-handling error. It is not a transaction failure.

## Browser evidence

The first strict browser runner displayed and captured the complete equations. It then failed its final external-request check because it counted eight blocked external requests. It counted zero Convex cloud requests. Before that final check, it created exactly two ordinal-1 draft attempts for the second synthetic learner. It did not create a final submission.

I compared `equation-after-second.json` with `equation-after-browser.json`.

- The two activity documents are unchanged.
- All eight variant documents are unchanged.
- All eight item documents are unchanged.
- Both learner documents are unchanged.
- All eight original final submission documents are unchanged.
- The only new submission documents are two ordinal-1 drafts for the second learner.
- All effect tables remain empty.

The successful follow-up runner reads those retained drafts. Its source contains no Start or submission action. Its network evidence contains four QF attempt requests. All four requests use GET. It contains no mutation request, Start request, or submission request.

The follow-up result proves these four states:

- The saved Guided result returns and displays `x^2 - 3x + 3 = 0`.
- The saved Independent result returns and displays `2x^2 - x + 1 = 0`.
- The pending Guided result returns and displays `x^2 + 5x - 5 = 0` with ordinal 1.
- The pending Independent result returns and displays `x^2 - 2x - 6 = 0` with ordinal 1.

I visually inspected the four follow-up screenshots. The pending activities render the equations with KaTeX and include `= 0`. The saved results show the same complete equations as their public GET responses.

The runner blocked six requests. Each request was for `https://fonts.googleapis.com/css2`. It recorded zero Convex cloud requests. The local application and local backend handled the verified data requests.

The retained database result states that the full snapshot after this read-only runner equals `equation-after-browser.json`. It also confirms eight original final submissions, two retained pending drafts, and zero effects. Thus, the successful follow-up added no database change.

## Review boundary

This review did not read credentials or private document values. It did not call the backend, modify the database, deploy source, or rerun the browser script.

The accepted result is the bounded local reconciliation and visible complete-equation presentation. The earlier eight-attempt evidence remains the transaction-flow proof.
