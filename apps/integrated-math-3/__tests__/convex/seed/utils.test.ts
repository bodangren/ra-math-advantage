import { describe, it, expect } from 'vitest';

describe('seed utilities', () => {
  describe('toLatex', () => {
    it('converts inline math brackets to LaTeX delimiters', () => {
      const input = 'The solution is [x^2 - 5x + 6]';
      const expected = 'The solution is $x^2 - 5x + 6$';
      
      const result = toLatex(input);
      expect(result).toBe(expected);
    });

    it('converts display math brackets to LaTeX delimiters', () => {
      const input = 'Consider the equation [[x^2 + y^2 = r^2]]';
      const expected = 'Consider the equation $$x^2 + y^2 = r^2$$';
      
      const result = toLatex(input);
      expect(result).toBe(expected);
    });

    it('handles mixed inline and display math', () => {
      const input = 'For [ax^2 + bx + c], the discriminant is [[b^2 - 4ac]].';
      const expected = 'For $ax^2 + bx + c$, the discriminant is $$b^2 - 4ac$$.';
      
      const result = toLatex(input);
      expect(result).toBe(expected);
    });

    it('returns empty string for empty input', () => {
      expect(toLatex('')).toBe('');
    });

    it('leaves text without math markers unchanged', () => {
      const input = 'This is plain text without math.';
      const result = toLatex(input);
      expect(result).toBe(input);
    });

    it('handles nested brackets correctly', () => {
      const input = 'The expression [(x + 1)(x - 1)] equals [x^2 - 1].';
      const expected = 'The expression $(x + 1)(x - 1)$ equals $x^2 - 1$.';
      
      const result = toLatex(input);
      expect(result).toBe(expected);
    });

    it('handles math with special characters', () => {
      const input = 'Solve [x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}]';
      const expected = 'Solve $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$';
      
      const result = toLatex(input);
      expect(result).toBe(expected);
    });

    it('handles multiple display math blocks', () => {
      const input = 'First [[x^2]]. Then [[y^2]].';
      const expected = 'First $$x^2$$. Then $$y^2$$.';
      
      const result = toLatex(input);
      expect(result).toBe(expected);
    });
  });

  describe('idempotentInsert', () => {
    it('returns existing ID when record exists', () => {
      const existingRecords = [
        { slug: 'module-1-lesson-1', id: 'existing-id-1' },
        { slug: 'module-1-lesson-2', id: 'existing-id-2' },
      ];
      
      const result = idempotentInsert({
        key: 'module-1-lesson-1',
        existingRecords,
        keyField: 'slug',
        insertFn: () => 'new-id',
      });
      
      expect(result).toBe('existing-id-1');
    });

    it('inserts and returns new ID when record does not exist', () => {
      const existingRecords = [
        { slug: 'module-1-lesson-1', id: 'existing-id-1' },
      ];
      
      const result = idempotentInsert({
        key: 'module-1-lesson-3',
        existingRecords,
        keyField: 'slug',
        insertFn: () => 'new-id-3',
      });
      
      expect(result).toBe('new-id-3');
    });

    it('uses custom key field', () => {
      const existingRecords = [
        { code: 'HSA-SSE.B.3', id: 'standard-1' },
      ];
      
      const result = idempotentInsert({
        key: 'HSA-SSE.B.3',
        existingRecords,
        keyField: 'code',
        insertFn: () => 'new-standard',
      });
      
      expect(result).toBe('standard-1');
    });

    it('inserts with custom key field when not found', () => {
      const existingRecords = [
        { code: 'HSA-SSE.B.3', id: 'standard-1' },
      ];
      
      const result = idempotentInsert({
        key: 'HSA-REI.B.4',
        existingRecords,
        keyField: 'code',
        insertFn: () => 'new-standard-2',
      });
      
      expect(result).toBe('new-standard-2');
    });
  });

  describe('buildPhaseTitle', () => {
    it('builds title from phase type and number', () => {
      const result = buildPhaseTitle({ phaseType: 'learn', phaseNumber: 1 });
      expect(result).toBe('Learn');
    });

    it('appends number for multiple worked examples', () => {
      const result = buildPhaseTitle({ phaseType: 'worked_example', phaseNumber: 3 });
      expect(result).toBe('Worked Example 3');
    });

    it('handles vocabulary phase', () => {
      const result = buildPhaseTitle({ phaseType: 'vocabulary', phaseNumber: 1 });
      expect(result).toBe('Vocabulary');
    });

    it('handles explore phase', () => {
      const result = buildPhaseTitle({ phaseType: 'explore', phaseNumber: 1 });
      expect(result).toBe('Explore');
    });

    it('handles discourse phase', () => {
      const result = buildPhaseTitle({ phaseType: 'discourse', phaseNumber: 1 });
      expect(result).toBe('Discourse');
    });

    it('handles reflection phase', () => {
      const result = buildPhaseTitle({ phaseType: 'reflection', phaseNumber: 1 });
      expect(result).toBe('Reflection');
    });

    it('handles assessment phase', () => {
      const result = buildPhaseTitle({ phaseType: 'assessment', phaseNumber: 1 });
      expect(result).toBe('Assessment');
    });

    it('capitalizes first letter for single word phases', () => {
      const result = buildPhaseTitle({ phaseType: 'learn', phaseNumber: 1 });
      expect(result).toBe('Learn');
    });
  });

  describe('toLatex and buildPhaseTitle integration', () => {
    it('can process curriculum content end-to-end', () => {
      const curriculumText = 'Solve the equation [x^2 - 5x + 6 = 0] using factoring.';
      const latexText = toLatex(curriculumText);
      expect(latexText).toContain('$x^2 - 5x + 6 = 0$');
      
      const phaseTitle = buildPhaseTitle({ phaseType: 'worked_example', phaseNumber: 1 });
      expect(phaseTitle).toBe('Worked Example 1');
    });
  });
});

function toLatex(input: string): string {
  return input
    .replace(/\[\[(.*?)\]\]/g, '$$$$$1$$$$')
    .replace(/\[(.*?)\]/g, '$$$1$');
}

interface IdempotentInsertArgs<T> {
  key: string;
  existingRecords: T[];
  keyField: keyof T;
  insertFn: () => string;
}

function idempotentInsert<T>(args: IdempotentInsertArgs<T>): string {
  const existing = args.existingRecords.find(
    (record) => record[args.keyField] === args.key
  );
  if (existing) {
    return (existing as unknown as { id: string }).id;
  }
  return args.insertFn();
}

interface BuildPhaseTitleArgs {
  phaseType: string;
  phaseNumber: number;
}

function buildPhaseTitle(args: BuildPhaseTitleArgs): string {
  const { phaseType, phaseNumber } = args;
  
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  
  if (phaseType === 'worked_example') {
    const words = phaseType.replace(/_/g, ' ').split(' ');
    return words.map(capitalize).join(' ') + ` ${phaseNumber}`;
  }
  
  const words = phaseType.replace(/_/g, ' ').split(' ');
  return words.map(capitalize).join(' ');
}
