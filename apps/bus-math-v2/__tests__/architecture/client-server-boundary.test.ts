import fs from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';

it('keeps privileged Convex helpers out of client components', () => {
  const violations: string[] = [];
  function scan(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) scan(filename);
      else if (/\.tsx?$/.test(filename)) {
        const source = fs.readFileSync(filename, 'utf8');
        if (/^['"]use client['"]/.test(source) && /from ['"]@\/lib\/convex\/server['"]/.test(source)) violations.push(filename);
      }
    }
  }
  scan('components'); scan('app'); scan('hooks');
  expect(violations).toEqual([]);
});
