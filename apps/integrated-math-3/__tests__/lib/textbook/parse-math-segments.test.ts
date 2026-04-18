import { describe, it, expect } from 'vitest';
import { parseMathSegments } from '@/lib/textbook/parse-math-segments';

describe('parseMathSegments', () => {
  describe('plain markdown', () => {
    it('returns single markdown segment for plain text', () => {
      const result = parseMathSegments('Hello world');
      expect(result).toEqual([
        { type: 'markdown', content: 'Hello world' }
      ]);
    });

    it('handles empty string', () => {
      const result = parseMathSegments('');
      expect(result).toEqual([]);
    });

    it('handles multiline markdown', () => {
      const result = parseMathSegments('Line 1\nLine 2\nLine 3');
      expect(result).toEqual([
        { type: 'markdown', content: 'Line 1\nLine 2\nLine 3' }
      ]);
    });
  });

  describe('inline math', () => {
    it('parses single inline math expression', () => {
      const result = parseMathSegments('The value is $x^2$.');
      expect(result).toEqual([
        { type: 'markdown', content: 'The value is ' },
        { type: 'inline-math', content: 'x^2' },
        { type: 'markdown', content: '.' }
      ]);
    });

    it('parses multiple inline math expressions', () => {
      const result = parseMathSegments('Given $a$ and $b$, find $c$.');
      expect(result).toEqual([
        { type: 'markdown', content: 'Given ' },
        { type: 'inline-math', content: 'a' },
        { type: 'markdown', content: ' and ' },
        { type: 'inline-math', content: 'b' },
        { type: 'markdown', content: ', find ' },
        { type: 'inline-math', content: 'c' },
        { type: 'markdown', content: '.' }
      ]);
    });

    it('does not parse $$ as inline math', () => {
      const result = parseMathSegments('Not inline $$x^2$$ here.');
      expect(result).toEqual([
        { type: 'markdown', content: 'Not inline ' },
        { type: 'block-math', content: 'x^2' },
        { type: 'markdown', content: ' here.' }
      ]);
    });

    it('handles inline math at start', () => {
      const result = parseMathSegments('$x+y=z$ is the equation.');
      expect(result).toEqual([
        { type: 'inline-math', content: 'x+y=z' },
        { type: 'markdown', content: ' is the equation.' }
      ]);
    });

    it('handles inline math at end', () => {
      const result = parseMathSegments('The answer is $42$.');
      expect(result).toEqual([
        { type: 'markdown', content: 'The answer is ' },
        { type: 'inline-math', content: '42' },
        { type: 'markdown', content: '.' }
      ]);
    });

    it('trims whitespace from inline math content', () => {
      const result = parseMathSegments('Value: $  x^2  $.');
      expect(result).toEqual([
        { type: 'markdown', content: 'Value: ' },
        { type: 'inline-math', content: 'x^2' },
        { type: 'markdown', content: '.' }
      ]);
    });
  });

  describe('block math with $$...$$', () => {
    it('parses single block math expression', () => {
      const result = parseMathSegments('Before\n$$x^2$$\nAfter');
      expect(result).toEqual([
        { type: 'markdown', content: 'Before\n' },
        { type: 'block-math', content: 'x^2' },
        { type: 'markdown', content: '\nAfter' }
      ]);
    });

    it('parses block math with multiline content', () => {
      const result = parseMathSegments('Formula:\n$$\n\\int_0^1 x dx\n= \\frac{1}{2}\n$$\nDone');
      expect(result).toEqual([
        { type: 'markdown', content: 'Formula:\n' },
        { type: 'block-math', content: '\\int_0^1 x dx\n= \\frac{1}{2}' },
        { type: 'markdown', content: '\nDone' }
      ]);
    });

    it('parses multiple block math expressions', () => {
      const result = parseMathSegments('First: $$x^2$$\nSecond: $$y^2$$');
      expect(result).toEqual([
        { type: 'markdown', content: 'First: ' },
        { type: 'block-math', content: 'x^2' },
        { type: 'markdown', content: '\nSecond: ' },
        { type: 'block-math', content: 'y^2' }
      ]);
    });

    it('handles block math at start', () => {
      const result = parseMathSegments('$$x^2$$ is the formula');
      expect(result).toEqual([
        { type: 'block-math', content: 'x^2' },
        { type: 'markdown', content: ' is the formula' }
      ]);
    });

    it('handles block math at end', () => {
      const result = parseMathSegments('The formula is $$x^2$$');
      expect(result).toEqual([
        { type: 'markdown', content: 'The formula is ' },
        { type: 'block-math', content: 'x^2' }
      ]);
    });
  });

  describe('block math with \\[...\\]', () => {
    it('parses block math with LaTeX delimiters', () => {
      const result = parseMathSegments('Before\n\\[x^2\\]\nAfter');
      expect(result).toEqual([
        { type: 'markdown', content: 'Before\n' },
        { type: 'block-math', content: 'x^2' },
        { type: 'markdown', content: '\nAfter' }
      ]);
    });

    it('parses multiple LaTeX block math expressions', () => {
      const result = parseMathSegments('First: \\[a\\]\nSecond: \\[b\\]');
      expect(result).toEqual([
        { type: 'markdown', content: 'First: ' },
        { type: 'block-math', content: 'a' },
        { type: 'markdown', content: '\nSecond: ' },
        { type: 'block-math', content: 'b' }
      ]);
    });

    it('handles mixed block math delimiters', () => {
      const result = parseMathSegments('$$x$$ and \\[y\\]');
      expect(result).toEqual([
        { type: 'block-math', content: 'x' },
        { type: 'markdown', content: ' and ' },
        { type: 'block-math', content: 'y' }
      ]);
    });
  });

  describe('mixed content', () => {
    it('parses inline and block math together', () => {
      const result = parseMathSegments('Let $x$ be a value.\nThen $$x^2$$ is squared.\nFinally $x+1$.');
      expect(result).toEqual([
        { type: 'markdown', content: 'Let ' },
        { type: 'inline-math', content: 'x' },
        { type: 'markdown', content: ' be a value.\nThen ' },
        { type: 'block-math', content: 'x^2' },
        { type: 'markdown', content: ' is squared.\nFinally ' },
        { type: 'inline-math', content: 'x+1' },
        { type: 'markdown', content: '.' }
      ]);
    });

    it('handles inline math inside block math boundaries', () => {
      const result = parseMathSegments('$$x$$ text $y$ more $$z$$');
      expect(result).toEqual([
        { type: 'block-math', content: 'x' },
        { type: 'markdown', content: ' text ' },
        { type: 'inline-math', content: 'y' },
        { type: 'markdown', content: ' more ' },
        { type: 'block-math', content: 'z' }
      ]);
    });

    it('handles complex markdown with headings and lists', () => {
      const result = parseMathSegments('# Heading\n\n- Item 1: $a$\n- Item 2: $b$\n\n$$\\sum a$$');
      expect(result).toEqual([
        { type: 'markdown', content: '# Heading\n\n- Item 1: ' },
        { type: 'inline-math', content: 'a' },
        { type: 'markdown', content: '\n- Item 2: ' },
        { type: 'inline-math', content: 'b' },
        { type: 'markdown', content: '\n\n' },
        { type: 'block-math', content: '\\sum a' }
      ]);
    });
  });

  describe('edge cases', () => {
    it('handles unmatched $ delimiter', () => {
      const result = parseMathSegments('Text $unmatched more text');
      expect(result).toEqual([
        { type: 'markdown', content: 'Text $unmatched more text' }
      ]);
    });

    it('handles single $', () => {
      const result = parseMathSegments('Price: $5');
      expect(result).toEqual([
        { type: 'markdown', content: 'Price: $5' }
      ]);
    });

    it('handles empty math expressions', () => {
      const result = parseMathSegments('Empty $$ and empty $$.');
      expect(result).toEqual([
        { type: 'markdown', content: 'Empty ' },
        { type: 'block-math', content: 'and empty' },
        { type: 'markdown', content: '.' }
      ]);
    });

    it('handles consecutive delimiters', () => {
      const result = parseMathSegments('$$a$$$$b$$');
      expect(result).toEqual([
        { type: 'block-math', content: 'a' },
        { type: 'block-math', content: 'b' }
      ]);
    });

    it('handles whitespace only content', () => {
      const result = parseMathSegments('   \n\n   ');
      expect(result).toEqual([
        { type: 'markdown', content: '   \n\n   ' }
      ]);
    });
  });
});
