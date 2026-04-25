import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('SRS dashboard page source', () => {
  it('imports MisconceptionPanel directly instead of wrapping it with next/dynamic', () => {
    const pagePath = path.resolve(process.cwd(), 'app/teacher/dashboard/srs/page.tsx');
    const page = fs.readFileSync(pagePath, 'utf8');

    expect(page).toContain('MisconceptionPanel');
    expect(page).not.toContain('next/dynamic');
    expect(page).not.toContain('ssr: false');
    expect(page).not.toContain('default: m.MisconceptionPanel');
  });
});
