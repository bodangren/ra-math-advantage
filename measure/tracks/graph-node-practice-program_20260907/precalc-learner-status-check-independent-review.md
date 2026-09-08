# Q32 student status link independent review

## Disposition

Accept the change for this narrow scope.

## Verified change

The saved baseline differs from the current files in four places only:

- The student dashboard pending message adds one plain anchor.
- The Topic 1.1 lesson pending message adds the same plain anchor.
- The dashboard test checks the link label and destination.
- The real Topic 1.1 lesson-flow test checks the link label and destination.

The anchor label is `Check lesson status`. Its destination is `/student/lessons/1.1`. The label states the action. The underline gives a visible link cue. The anchor remains keyboard accessible. It uses normal browser navigation.

## Behavior and trust boundary

The anchor has no click handler. It has no client state. It does not call a mutation. It does not include a learner ID, submission ID, class ID, or teacher decision. The destination contains only the public lesson topic.

A navigation to `/student/lessons/1.1` starts a normal request. The server page authenticates the student. It then calls the learner delivery-state query again. Thus the request can observe a new teacher confirmation without polling or a new persistence mechanism.

The link on the lesson page points to the current canonical Topic 1.1 URL. The link on the dashboard points to the same server page. A repeated request is safe because the page performs reads only for this status decision.

## Test scope

The dashboard test proves that the pending state shows the link and does not show the Worked or practice components.

The real backend and lesson-page test is sufficient for this small server-rendered navigation change. It creates the real acknowledgement. It renders the pending page. It records the real teacher confirmation. It renders the page again. The second render shows Guided and Independent practice. This proves that a fresh server render observes the changed authority state.

The tests do not drive a browser navigation event. The change does not claim a browser journey. That limit is appropriate because the anchor uses native navigation and has no custom client behavior.

No accessibility, data exposure, or write-path blocker was found.

## Parent lint correction

Each native anchor has a narrow lint suppression. The comment states why a normal document request is required on the same lesson URL. This avoids a cached client navigation. No authority check changes.
