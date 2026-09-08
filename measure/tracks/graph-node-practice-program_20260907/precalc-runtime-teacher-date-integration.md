# Teacher date rendering integration

The teacher confirmation form now formats the submitted date with locale en-US and timezone UTC. The visible UTC label states the timezone. Server rendering and browser hydration therefore use the same text.

The ISO dateTime attribute, stored timestamp, and query remain unchanged. The regression renders server markup in UTC and hydrates it in Asia/Shanghai. It restores an absent TZ variable with delete after the test.

Independent review accepted both changed files and passed seven focused tests. Parent verification passed 17 component, dashboard, route, and composed-flow tests. App lint, build, and post-build standalone TypeScript passed. All 21 workspace packages resolve inside the candidate. Both staged files match candidate bytes.

Actual browser verification in Asia/Shanghai remains open. The earlier assisted browser proof used UTC to avoid this diagnosed defect.
