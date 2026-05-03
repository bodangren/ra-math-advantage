import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const BM2_ROOT = path.resolve(__dirname, '../..');
const CURRICULUM = path.join(BM2_ROOT, 'curriculum');

describe('Curriculum Infrastructure', () => {
  it('should have the templates directory', () => {
    expect(fs.existsSync(path.join(CURRICULUM, 'templates'))).toBe(true);
  });

  it('should have the unit 01 directory', () => {
    expect(fs.existsSync(path.join(CURRICULUM, 'units', 'unit_01'))).toBe(true);
  });

  it('should have the launch template', () => {
    expect(fs.existsSync(path.join(CURRICULUM, 'templates', 'launch.md'))).toBe(true);
  });

  it('should have the accounting template', () => {
    expect(fs.existsSync(path.join(CURRICULUM, 'templates', 'accounting.md'))).toBe(true);
  });

  it('should have the excel template', () => {
    expect(fs.existsSync(path.join(CURRICULUM, 'templates', 'excel.md'))).toBe(true);
  });

  it('should have the project template', () => {
    expect(fs.existsSync(path.join(CURRICULUM, 'templates', 'project.md'))).toBe(true);
  });

  it('should have the assessment template', () => {
    expect(fs.existsSync(path.join(CURRICULUM, 'templates', 'assessment.md'))).toBe(true);
  });

  it('should have a valid manifest for unit 01', () => {
    const manifestPath = path.join(CURRICULUM, 'units', 'unit_01', 'manifest.md');
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    expect(manifest.length).toBeGreaterThan(0);
  });

  it('should have implemented U01L01_launch.md', () => {
    const lessonPath = path.join(CURRICULUM, 'units', 'unit_01', 'U01L01_launch.md');
    expect(fs.existsSync(lessonPath)).toBe(true);
  });

  it('should have implemented accounting lessons U01L02 to U01L04', () => {
    for (const n of ['02', '03', '04']) {
      expect(
        fs.existsSync(path.join(CURRICULUM, 'units', 'unit_01', `U01L${n}_accounting.md`)),
      ).toBe(true);
    }
  });

  it('should have implemented excel lessons U01L05 to U01L07', () => {
    for (const n of ['05', '06', '07']) {
      expect(
        fs.existsSync(path.join(CURRICULUM, 'units', 'unit_01', `U01L${n}_excel.md`)),
      ).toBe(true);
    }
  });

  it('should follow the file naming convention UXXLXX_{type}.md in unit_01', () => {
    const unitDir = path.join(CURRICULUM, 'units', 'unit_01');
    const files = fs.readdirSync(unitDir);
    for (const file of files) {
      expect(file).toMatch(/^U01L\d{2}_(launch|accounting|excel|project|assessment)\.md$|^manifest\.md$/);
    }
  });

  it('should have implemented project sprint lessons U01L08 to U01L10', () => {
    for (const n of ['08', '09', '10']) {
      expect(
        fs.existsSync(path.join(CURRICULUM, 'units', 'unit_01', `U01L${n}_project.md`)),
      ).toBe(true);
    }
  });

  it('should have implemented assessment lesson U01L11_assessment.md', () => {
    expect(
      fs.existsSync(path.join(CURRICULUM, 'units', 'unit_01', 'U01L11_assessment.md')),
    ).toBe(true);
  });
});
