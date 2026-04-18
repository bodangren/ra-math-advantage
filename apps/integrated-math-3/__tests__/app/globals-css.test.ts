import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

const cssPath = path.resolve(__dirname, '../../app/globals.css');

describe('app/globals.css', () => {
  it('exists', () => {
    expect(existsSync(cssPath)).toBe(true);
  });

  it('contains Tailwind directives', () => {
    const content = readFileSync(cssPath, 'utf-8');
    expect(content).toContain('@tailwind base');
    expect(content).toContain('@tailwind components');
    expect(content).toContain('@tailwind utilities');
  });

  it('defines oklch CSS custom properties for light and dark modes', () => {
    const content = readFileSync(cssPath, 'utf-8');
    expect(content).toContain('--background:');
    expect(content).toContain('--foreground:');
    expect(content).toContain('--primary:');
    expect(content).toContain('.dark {');
  });

  it('includes font family variables', () => {
    const content = readFileSync(cssPath, 'utf-8');
    expect(content).toContain('--font-display');
    expect(content).toContain('--font-body');
    expect(content).toContain('--font-mono-num');
  });

  it('includes staggered fade-up animation classes', () => {
    const content = readFileSync(cssPath, 'utf-8');
    expect(content).toContain('animate-fade-up');
    expect(content).toContain('@keyframes fadeUp');
  });
});
