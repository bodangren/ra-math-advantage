import { describe, it, expect } from 'vitest';
import {
  GLOSSARY,
  getGlossaryTermBySlug,
  getGlossaryTermsByModule,
  getAllGlossaryModules,
  getAllGlossaryTopics,
} from '@/lib/study/glossary';

describe('glossary', () => {
  describe('getGlossaryTermBySlug', () => {
    it('returns the term with matching slug', () => {
      const term = getGlossaryTermBySlug('quadratic-function');
      expect(term).toBeDefined();
      expect(term?.term).toBe('Quadratic Function');
    });

    it('returns undefined for non-existent slug', () => {
      const term = getGlossaryTermBySlug('non-existent-term');
      expect(term).toBeUndefined();
    });

    it('finds terms across all modules', () => {
      const sine = getGlossaryTermBySlug('sine');
      expect(sine).toBeDefined();
      expect(sine?.modules).toContain(9);
    });
  });

  describe('getGlossaryTermsByModule', () => {
    it('returns terms belonging to module 1', () => {
      const terms = getGlossaryTermsByModule(1);
      expect(terms.length).toBeGreaterThan(0);
      terms.forEach((term) => {
        expect(term.modules).toContain(1);
      });
    });

    it('returns terms belonging to module 9', () => {
      const terms = getGlossaryTermsByModule(9);
      expect(terms.length).toBeGreaterThan(0);
      terms.forEach((term) => {
        expect(term.modules).toContain(9);
      });
    });

    it('returns empty array for module with no terms', () => {
      const terms = getGlossaryTermsByModule(99);
      expect(terms).toEqual([]);
    });

    it('returns terms that span multiple modules', () => {
      const terms = getGlossaryTermsByModule(5);
      const logarithm = terms.find((t) => t.slug === 'logarithm');
      expect(logarithm).toBeDefined();
      expect(logarithm?.modules).toContain(6);
    });
  });

  describe('getAllGlossaryModules', () => {
    it('returns sorted array of module numbers', () => {
      const modules = getAllGlossaryModules();
      expect(modules).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('each module has at least one term', () => {
      const modules = getAllGlossaryModules();
      modules.forEach((mod) => {
        const terms = getGlossaryTermsByModule(mod);
        expect(terms.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getAllGlossaryTopics', () => {
    it('returns sorted array of unique topics', () => {
      const topics = getAllGlossaryTopics();
      expect(topics.length).toBeGreaterThan(0);
      const sorted = [...topics].sort();
      expect(topics).toEqual(sorted);
    });

    it('contains expected topics', () => {
      const topics = getAllGlossaryTopics();
      expect(topics).toContain('quadratic-functions');
      expect(topics).toContain('trigonometry');
      expect(topics).toContain('statistics');
    });
  });

  describe('GLOSSARY', () => {
    it('contains 60-80 terms as specified', () => {
      expect(GLOSSARY.length).toBeGreaterThanOrEqual(60);
      expect(GLOSSARY.length).toBeLessThanOrEqual(80);
    });

    it('each term has a slug, term, definition, modules, topics', () => {
      GLOSSARY.forEach((term) => {
        expect(term.slug).toBeTruthy();
        expect(term.term).toBeTruthy();
        expect(term.definition).toBeTruthy();
        expect(term.modules).toBeTruthy();
        expect(Array.isArray(term.modules)).toBe(true);
        expect(term.topics).toBeTruthy();
        expect(Array.isArray(term.topics)).toBe(true);
      });
    });

    it('each slug is unique', () => {
      const slugs = GLOSSARY.map((t) => t.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(GLOSSARY.length);
    });

    it('all module numbers are between 1 and 9', () => {
      GLOSSARY.forEach((term) => {
        term.modules.forEach((mod) => {
          expect(mod).toBeGreaterThanOrEqual(1);
          expect(mod).toBeLessThanOrEqual(9);
        });
      });
    });
  });
});
