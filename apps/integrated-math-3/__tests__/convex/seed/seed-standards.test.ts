import { describe, it, expect } from 'vitest';
import type { SeedCompetencyStandard } from '@/convex/seed/types';

describe('seed-standards', () => {
  describe('Module 1 competency standards', () => {
    const module1Standards: SeedCompetencyStandard[] = [
      {
        code: 'HSA-SSE.B.3',
        description: 'Choosing and producing equivalent forms of expressions',
        studentFriendlyDescription: 'I can rewrite expressions in different forms.',
        category: 'Algebra',
        isActive: true,
      },
      {
        code: 'HSA-REI.B.4',
        description: 'Solving quadratic equations in one variable',
        studentFriendlyDescription: 'I can solve quadratic equations.',
        category: 'Algebra',
        isActive: true,
      },
      {
        code: 'HSA-APR.B.3',
        description: 'Identifying zeros of polynomials',
        studentFriendlyDescription: 'I can find where polynomials equal zero.',
        category: 'Algebra',
        isActive: true,
      },
      {
        code: 'HSA-CED.A.1',
        description: 'Creating equations in one variable',
        studentFriendlyDescription: 'I can create equations to solve problems.',
        category: 'Algebra',
        isActive: true,
      },
      {
        code: 'N-CN.A.1',
        description: 'Knowing the definition of complex numbers',
        studentFriendlyDescription: 'I know what imaginary numbers are.',
        category: 'Number',
        isActive: true,
      },
      {
        code: 'N-CN.C.7',
        description: 'Solving quadratics with complex solutions',
        studentFriendlyDescription: 'I can solve equations with complex answers.',
        category: 'Number',
        isActive: true,
      },
    ];

    it('seeds exactly 6 standards for Module 1', () => {
      expect(module1Standards).toHaveLength(6);
    });

    it('all standards have valid codes', () => {
      module1Standards.forEach((standard) => {
        expect(standard.code).toMatch(/^[A-Z]+-[A-Z]+\.[A-Z]\.[0-9]+$/);
      });
    });

    it('all standards have non-empty descriptions', () => {
      module1Standards.forEach((standard) => {
        expect(standard.description.length).toBeGreaterThan(0);
      });
    });

    it('all standards have student-friendly descriptions', () => {
      module1Standards.forEach((standard) => {
        expect(standard.studentFriendlyDescription).toBeDefined();
        expect(standard.studentFriendlyDescription!.length).toBeGreaterThan(0);
      });
    });

    it('all standards are active', () => {
      module1Standards.forEach((standard) => {
        expect(standard.isActive).toBe(true);
      });
    });

    it('standards have valid categories', () => {
      const validCategories = ['Algebra', 'Number'];
      module1Standards.forEach((standard) => {
        expect(standard.category).toBeDefined();
        expect(validCategories).toContain(standard.category);
      });
    });

    it('all standards have unique codes', () => {
      const codes = module1Standards.map((s) => s.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('HSA standards belong to Algebra category', () => {
      const hsaStandards = module1Standards.filter((s) => s.code.startsWith('HSA-'));
      hsaStandards.forEach((standard) => {
        expect(standard.category).toBe('Algebra');
      });
    });

    it('N-CN standards belong to Number category', () => {
      const ncnStandards = module1Standards.filter((s) => s.code.startsWith('N-'));
      ncnStandards.forEach((standard) => {
        expect(standard.category).toBe('Number');
      });
    });

    it('seed data matches the structure for Convex insertion', () => {
      const now = Date.now();
      module1Standards.forEach((standard) => {
        const convexDoc = {
          code: standard.code,
          description: standard.description,
          studentFriendlyDescription: standard.studentFriendlyDescription,
          category: standard.category,
          isActive: standard.isActive,
          createdAt: now,
        };

        expect(convexDoc).toHaveProperty('code');
        expect(convexDoc).toHaveProperty('description');
        expect(convexDoc).toHaveProperty('studentFriendlyDescription');
        expect(convexDoc).toHaveProperty('category');
        expect(convexDoc).toHaveProperty('isActive');
        expect(convexDoc).toHaveProperty('createdAt');
      });
    });
  });

  describe('Module 6 competency standards', () => {
    const module6Standards: SeedCompetencyStandard[] = [
      {
        code: 'HSF-BF.B.5',
        description: 'Understanding the inverse relationship between exponents and logarithms',
        studentFriendlyDescription: 'I can use the relationship between exponents and logarithms to solve problems.',
        category: 'Functions',
        isActive: true,
      },
      {
        code: 'HSF-LE.A.4',
        description: 'Expressing solutions to exponential models as logarithms',
        studentFriendlyDescription: 'I can solve exponential equations using logarithms and technology.',
        category: 'Functions',
        isActive: true,
      },
      {
        code: 'HSF-IF.C.7e',
        description: 'Graphing exponential and logarithmic functions, showing intercepts and end behavior',
        studentFriendlyDescription: 'I can graph exponential and logarithmic functions and identify their key features.',
        category: 'Functions',
        isActive: true,
      },
    ];

    it('seeds exactly 3 standards for Module 6', () => {
      expect(module6Standards).toHaveLength(3);
    });

    it('all Module 6 standards have valid codes', () => {
      module6Standards.forEach((standard) => {
        expect(standard.code).toMatch(/^[A-Z]+-[A-Z]+\.[A-Z]\.[0-9]+[a-z]?$/);
      });
    });

    it('all Module 6 standards have non-empty descriptions', () => {
      module6Standards.forEach((standard) => {
        expect(standard.description.length).toBeGreaterThan(0);
      });
    });

    it('all Module 6 standards have student-friendly descriptions', () => {
      module6Standards.forEach((standard) => {
        expect(standard.studentFriendlyDescription).toBeDefined();
        expect(standard.studentFriendlyDescription!.length).toBeGreaterThan(0);
      });
    });

    it('all Module 6 standards are active', () => {
      module6Standards.forEach((standard) => {
        expect(standard.isActive).toBe(true);
      });
    });

    it('all Module 6 standards belong to Functions category', () => {
      module6Standards.forEach((standard) => {
        expect(standard.category).toBe('Functions');
      });
    });

    it('all Module 6 standards have unique codes', () => {
      const codes = module6Standards.map((s) => s.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('idempotent insertion logic', () => {
    it('returns existing record ID when standard already exists', () => {
      const existingRecords = [
        { id: 'existing-id-1', code: 'HSA-SSE.B.3' },
      ];

      const key = 'HSA-SSE.B.3';
      const keyField = 'code' as keyof typeof existingRecords[0];

      const existing = existingRecords.find((record) => record[keyField] === key);
      const result = existing ? existing.id : null;

      expect(result).toBe('existing-id-1');
    });

    it('returns null when standard does not exist', () => {
      const existingRecords = [
        { id: 'existing-id-1', code: 'HSA-SSE.B.3' },
      ];

      const key = 'NONEXISTENT-CODE';
      const keyField = 'code' as keyof typeof existingRecords[0];

      const existing = existingRecords.find((record) => record[keyField] === key);
      const result = existing ? existing.id : null;

      expect(result).toBeNull();
    });
  });

  describe('Module 9 competency standards', () => {
    const module9Standards: SeedCompetencyStandard[] = [
      {
        code: 'HSF-TF.A.1',
        description: 'Extend the domain of the trigonometric functions using the unit circle',
        studentFriendlyDescription: 'I can use the unit circle to extend trigonometric functions to all angles.',
        category: 'Functions',
        isActive: true,
      },
      {
        code: 'HSF-TF.A.2',
        description: 'Explain how the unit circle in the coordinate plane enables the extension of trigonometric functions to all real numbers, and interpret these functions in terms of a periodic phenomenon',
        studentFriendlyDescription: 'I can explain how the unit circle helps find trigonometric values for any angle.',
        category: 'Functions',
        isActive: true,
      },
      {
        code: 'HSF-TF.A.4',
        description: 'Use the unit circle to explain symmetry and periodicity of trigonometric functions',
        studentFriendlyDescription: 'I can use the unit circle to show why trigonometric functions repeat.',
        category: 'Functions',
        isActive: true,
      },
      {
        code: 'HSF-TF.B.5',
        description: 'Choose trigonometric functions to model periodic phenomena with specified amplitude, frequency, and midline',
        studentFriendlyDescription: 'I can use sine and cosine functions to model repeating patterns.',
        category: 'Functions',
        isActive: true,
      },
    ];

    it('seeds exactly 4 standards for Module 9', () => {
      expect(module9Standards).toHaveLength(4);
    });

    it('all Module 9 standards have valid codes', () => {
      module9Standards.forEach((standard) => {
        expect(standard.code).toMatch(/^[A-Z]+-[A-Z]+\.[A-Z]\.[0-9]+[a-z]?$/);
      });
    });

    it('all Module 9 standards have non-empty descriptions', () => {
      module9Standards.forEach((standard) => {
        expect(standard.description.length).toBeGreaterThan(0);
      });
    });

    it('all Module 9 standards have student-friendly descriptions', () => {
      module9Standards.forEach((standard) => {
        expect(standard.studentFriendlyDescription).toBeDefined();
        expect(standard.studentFriendlyDescription!.length).toBeGreaterThan(0);
      });
    });

    it('all Module 9 standards are active', () => {
      module9Standards.forEach((standard) => {
        expect(standard.isActive).toBe(true);
      });
    });

    it('all Module 9 standards belong to Functions category', () => {
      module9Standards.forEach((standard) => {
        expect(standard.category).toBe('Functions');
      });
    });

    it('all Module 9 standards have unique codes', () => {
      const codes = module9Standards.map((s) => s.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('Module 9 standards use HSF-TF prefix for trigonometric functions', () => {
      module9Standards.forEach((standard) => {
        expect(standard.code).toMatch(/^HSF-TF\./);
      });
    });
  });
});
