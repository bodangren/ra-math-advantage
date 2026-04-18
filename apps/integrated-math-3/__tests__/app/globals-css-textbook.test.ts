import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

const css = readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf-8');

describe('globals.css — textbook typography', () => {
  describe('.textbook-content scope', () => {
    it('defines .textbook-content class', () => {
      expect(css).toContain('.textbook-content');
    });

    it('has heading hierarchy for h1–h4 inside .textbook-content', () => {
      expect(css).toMatch(/\.textbook-content\s+h[1-4]/);
    });

    it('sets font-family to font-display for textbook headings', () => {
      // Heading style should reference the display font variable
      expect(css).toMatch(/font-family.*font-display|--font-display/);
    });

    it('sets math-friendly line-height', () => {
      expect(css).toContain('line-height');
    });

    it('has spacing rules for math content (KaTeX)', () => {
      // Spacing for .katex or .katex-display
      expect(css).toMatch(/\.katex/);
    });
  });

  describe('responsive font scaling', () => {
    it('uses clamp() or responsive units for textbook font scaling', () => {
      expect(css).toMatch(/clamp\(|@media.*min-width/);
    });
  });

  describe('print styles', () => {
    it('includes @media print block', () => {
      expect(css).toContain('@media print');
    });

    it('hides navigation in print', () => {
      // Navigation (sidebar, header nav) should be hidden in print
      expect(css).toMatch(/@media print[\s\S]*?display\s*:\s*none/);
    });
  });

  describe('dark mode compatibility', () => {
    it('has .dark variants or CSS variable usage for textbook content', () => {
      // Either uses CSS vars (which already have dark overrides) or explicit .dark rules
      // The existing oklch vars handle dark mode — textbook content should use them
      expect(css).toContain('.dark');
    });
  });
});
