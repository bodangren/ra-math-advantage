import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@/lib/convex/server', () => ({
  fetchQuery: vi.fn().mockResolvedValue([
    {
      unitNumber: 1,
      title: 'Quadratic Functions',
      description: 'Explore quadratic functions and complex numbers.',
      objectives: ['Solve quadratics', 'Work with complex numbers'],
      lessons: [
        { id: 'l1', title: 'Intro to Quadratics', slug: 'intro-quadratics', description: null, orderIndex: 1 },
      ],
    },
    {
      unitNumber: 2,
      title: 'Polynomials',
      description: 'Polynomial functions and operations.',
      objectives: [],
      lessons: [
        { id: 'l2', title: 'Polynomial Basics', slug: 'polynomial-basics', description: null, orderIndex: 1 },
      ],
    },
  ]),
  api: { public: { getCurriculum: 'mock' } },
}));

describe('CurriculumPage', () => {
  it('renders course title heading', async () => {
    const { default: CurriculumPage } = await import('@/app/curriculum/page');
    const jsx = await CurriculumPage();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/curriculum/i);
  });

  it('renders unit titles from data', async () => {
    const { default: CurriculumPage } = await import('@/app/curriculum/page');
    const jsx = await CurriculumPage();
    render(jsx);
    expect(screen.getAllByText(/quadratic functions/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/polynomials/i).length).toBeGreaterThan(0);
  });

  it('renders lesson titles', async () => {
    const { default: CurriculumPage } = await import('@/app/curriculum/page');
    const jsx = await CurriculumPage();
    render(jsx);
    expect(screen.getByText(/intro to quadratics/i)).toBeInTheDocument();
  });
});
