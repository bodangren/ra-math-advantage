import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getWorkbookAsset, getPdfAsset, getDatasetAsset } from '@/lib/server/lesson-assets';

describe('worker lesson assets', () => {
  it('inlines real student and teacher workbooks into server imports', () => {
    for (const type of ['student', 'teacher'] as const) {
      const content = getWorkbookAsset(`unit_05_lesson_04_${type}.xlsx`, type);
      expect(Array.from(content!.slice(0, 2))).toEqual([80, 75]);
    }
    expect(getWorkbookAsset('unit_05_lesson_04_teacher.xlsx', 'student')).toBeNull();
    expect(fs.existsSync('public/workbooks/unit_05_lesson_04_teacher.xlsx')).toBe(false);
  });
  it('loads the missing guides and correct dataset schema', () => {
    expect(new TextDecoder().decode(getPdfAsset('unit_05_foundation_guide.pdf')!.slice(0, 4))).toBe('%PDF');
    expect(getDatasetAsset('unit_04_class_dataset.csv')).toContain('Regular hours,40');
    expect(getDatasetAsset('unit_06_class_dataset.csv')).toContain('Opening units,40');
  });
  it('does not resolve path traversal or unknown files', () => {
    expect(getWorkbookAsset('../secret.xlsx', 'teacher')).toBeNull();
    expect(getPdfAsset('missing.pdf')).toBeNull();
    expect(getDatasetAsset('../../.env.local')).toBeNull();
  });
});
