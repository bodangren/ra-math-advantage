'use client';

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RateOfChangeCalculator } from '@/components/activities/roc/RateOfChangeCalculator';

const defaultProps = {
  activityId: 'test-activity',
  mode: 'teaching' as const,
  onSubmit: vi.fn(),
  onComplete: vi.fn(),
};

describe('RateOfChangeCalculator', () => {
  describe('teaching mode', () => {
    describe('from_equation', () => {
      it('renders formula for rate of change', () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="function"
            data={{ expression: 'y = 2x + 3' }}
            interval={{ start: 0, end: 5 }}
          />
        );

        expect(screen.getByText('Rate of Change Calculator')).toBeInTheDocument();
        expect(screen.getByText(/formula/i)).toBeInTheDocument();
      });

      it('shows f(a) and f(b) computed and labeled', () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="function"
            data={{ expression: 'y = 2x + 3' }}
            interval={{ start: 0, end: 5 }}
          />
        );

        expect(screen.getByText(/f\(0\)/i)).toBeInTheDocument();
        expect(screen.getByText(/f\(5\)/i)).toBeInTheDocument();
      });
    });

    describe('from_table', () => {
      it('renders table data', () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="table"
            data={{
              x: [0, 1, 2, 3],
              y: [0, 2, 4, 6],
            }}
            interval={{ start: 0, end: 3 }}
          />
        );

        expect(screen.getByText('x')).toBeInTheDocument();
        expect(screen.getByText('y')).toBeInTheDocument();
      });

      it('highlights rows within the interval', () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="table"
            data={{
              x: [0, 1, 2, 3],
              y: [0, 2, 4, 6],
            }}
            interval={{ start: 0, end: 3 }}
          />
        );

        const highlightedElements = screen.getAllByTestId(/highlighted|selected/i);
        expect(highlightedElements.length).toBeGreaterThan(0);
      });

      it('applies rate of change formula', () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="table"
            data={{
              x: [0, 1, 2, 3],
              y: [0, 2, 4, 6],
            }}
            interval={{ start: 0, end: 3 }}
          />
        );

        expect(screen.getByText(/\(6\s*-\s*0\)\s*\/\s*\(3\s*-\s*0\)/i)).toBeInTheDocument();
      });
    });

    describe('from_graph', () => {
      it('renders graph data points', () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="graph"
            data={{
              points: [
                [0, 1],
                [1, 3],
                [2, 5],
              ],
            }}
            interval={{ start: 0, end: 2 }}
          />
        );

        expect(screen.getByText(/\(0,\s*1\)/i)).toBeInTheDocument();
        expect(screen.getByText(/\(1,\s*3\)/i)).toBeInTheDocument();
        expect(screen.getByText(/\(2,\s*5\)/i)).toBeInTheDocument();
      });

      it('shows estimation label', () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="graph"
            data={{
              points: [
                [0, 1],
                [1, 3],
                [2, 5],
              ],
            }}
            interval={{ start: 0, end: 2 }}
          />
        );

        expect(screen.getByText(/Estimation/i)).toBeInTheDocument();
      });

      it('shows exact value label', () => {
        render(
          <RateOfChangeCalculator
            {...defaultProps}
            sourceType="graph"
            data={{
              points: [
                [0, 1],
                [1, 3],
                [2, 5],
              ],
            }}
            interval={{ start: 0, end: 2 }}
          />
        );

        expect(screen.getByText(/Exact Value/i)).toBeInTheDocument();
      });
    });
  });

  describe('guided mode', () => {
    it('shows one step at a time', () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="guided"
          sourceType="table"
          data={{
            x: [0, 1, 2, 3],
            y: [0, 2, 4, 6],
          }}
          interval={{ start: 0, end: 3 }}
        />
      );

      const stepIndicator = screen.getByText(/\d+\s+of\s+\d+/i);
      expect(stepIndicator).toBeInTheDocument();
    });

    it('validates each sub-step', () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="guided"
          sourceType="table"
          data={{
            x: [0, 1, 2, 3],
            y: [0, 2, 4, 6],
          }}
          interval={{ start: 0, end: 3 }}
        />
      );

      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBeGreaterThan(0);
    });
  });

  describe('practice mode', () => {
    it('shows answer input field', () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="practice"
          sourceType="table"
          data={{
            x: [0, 1, 2, 3],
            y: [0, 2, 4, 6],
          }}
          interval={{ start: 0, end: 3 }}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('has submit button', () => {
      render(
        <RateOfChangeCalculator
          {...defaultProps}
          mode="practice"
          sourceType="table"
          data={{
            x: [0, 1, 2, 3],
            y: [0, 2, 4, 6],
          }}
          interval={{ start: 0, end: 3 }}
        />
      );

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});