# Precalculus Q37 Corrected Guided 500 Diagnosis

## Decision

The HTTP 500 was a browser automation readiness error. It was not a production mutation or evidence-bridge defect.

## Exact failure boundary

The local Convex function log records this error for each failed request:

`activities:createServerOwnedSubmission`: `Invalid Precalculus pilot answers` at `canonical`, before the mutation inserts a physical submission.

No `selectedLearningEvidence:submitSelected` call followed the failed requests. The failure therefore occurred in physical-submission validation. It did not occur in evidence processing.

## Root cause

The practice script filled inputs immediately after `page.goto`. The server-rendered fields were visible before React hydration finished. The browser showed the filled text. Hydration then replaced the input state before the submit handler read it.

A request listener captured the actual failed browser envelope. It had the three correct answer keys and part IDs, but all three answer values were empty strings. The Convex `canonical` function correctly rejected these values.

This behavior also explains the safe HTTP 500 projection. The public route hid the internal validation detail as designed.

## Correction and proof

The disposable browser script now waits for the lesson page network-idle state before it fills the practice form. It then uses the visible fields and submit buttons without a handler bypass.

The corrected real browser sequence passed:

- corrected Guided: score `3/3`, attempt ordinal 2, one linked non-mastery receipt,
- wrong Independent: score `0/3`, attempt ordinal 1, one linked mastery-bearing evidence result and `Again` review,
- correct Independent: score `3/3`, attempt ordinal 2, one linked mastery-bearing evidence result and `Good` review,
- final SRS state: one card, two reviews,
- lesson reload: all five submission IDs, five evidence rows, four receipt IDs, one card ID, and two review records remained stable.

All stored assistance counters are zero because the component has no hint or reveal controls.

## Code and test scope

No production code change is required for this HTTP 500. A production regression test would encode browser-runner timing and would not test a product contract.

The verification script must wait for hydration before it changes controlled React inputs. A focused browser harness check can also assert the outgoing answer values before it accepts the request.

The temporary route logging line was removed. The backend stayed live. The main workspace and acknowledgement code did not change.
